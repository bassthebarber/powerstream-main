// backend/src/loaders/jobs.js
// BullMQ queue setup and job processors
import { Queue, Worker, QueueScheduler } from "bullmq";
import { getRedis, isRedisConnected } from "../config/redis.js";
import { logger } from "../config/logger.js";

// Queue instances
const queues = {};
const workers = {};
const schedulers = {};

/**
 * Get Redis connection for BullMQ
 */
const getConnection = () => {
  const redis = getRedis();
  if (!redis) return null;
  
  // BullMQ expects IORedis-compatible client
  // If using node-redis, we need to return connection options instead
  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
  };
};

/**
 * Create a queue
 */
export const createQueue = (name, options = {}) => {
  if (queues[name]) return queues[name];
  
  const connection = getConnection();
  if (!connection) {
    logger.warn(`Cannot create queue ${name}: Redis not available`);
    return null;
  }
  
  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      ...options,
    },
  });
  
  queues[name] = queue;
  logger.info(`✅ Queue created: ${name}`);
  
  return queue;
};

/**
 * Create a worker for a queue
 */
export const createWorker = (queueName, processor, options = {}) => {
  const connection = getConnection();
  if (!connection) {
    logger.warn(`Cannot create worker for ${queueName}: Redis not available`);
    return null;
  }
  
  const worker = new Worker(queueName, processor, {
    connection,
    concurrency: options.concurrency || 5,
    ...options,
  });
  
  worker.on("completed", (job) => {
    logger.debug(`Job ${job.id} in ${queueName} completed`);
  });
  
  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} in ${queueName} failed:`, err.message);
  });
  
  worker.on("error", (err) => {
    logger.error(`Worker error in ${queueName}:`, err.message);
  });
  
  workers[queueName] = worker;
  logger.info(`✅ Worker created for queue: ${queueName}`);
  
  return worker;
};

// ============================================================
// EVENTS QUEUE
// ============================================================

const EVENTS_QUEUE = "events";

/**
 * Initialize events queue for analytics and tracking
 */
export const initEventsQueue = () => {
  const queue = createQueue(EVENTS_QUEUE);
  if (!queue) return null;
  
  // Create worker to process events
  createWorker(EVENTS_QUEUE, async (job) => {
    const { type, userId, entityType, entityId, metadata } = job.data;
    
    try {
      // Import Event model dynamically to avoid circular deps
      const { default: Event } = await import("../domain/models/Event.model.js");
      
      await Event.create({
        userId,
        type,
        entityType,
        entityId,
        metadata,
        processedAt: new Date(),
      });
      
      logger.debug(`Event processed: ${type} for user ${userId}`);
    } catch (err) {
      logger.error(`Failed to process event:`, err.message);
      throw err; // Retry
    }
  });
  
  return queue;
};

/**
 * Log an event (async, non-blocking)
 */
export const logEvent = async (userId, type, entityType, entityId, metadata = {}) => {
  const queue = queues[EVENTS_QUEUE];
  
  if (!queue) {
    // Fallback: log directly if queue not available
    logger.debug(`Event (no queue): ${type} for user ${userId}`);
    return null;
  }
  
  try {
    const job = await queue.add("logEvent", {
      userId,
      type,
      entityType,
      entityId,
      metadata,
      timestamp: Date.now(),
    });
    
    return job.id;
  } catch (err) {
    logger.error(`Failed to queue event:`, err.message);
    return null;
  }
};

// ============================================================
// NOTIFICATIONS QUEUE
// ============================================================

const NOTIFICATIONS_QUEUE = "notifications";

/**
 * Initialize notifications queue
 */
export const initNotificationsQueue = () => {
  const queue = createQueue(NOTIFICATIONS_QUEUE);
  if (!queue) return null;
  
  createWorker(NOTIFICATIONS_QUEUE, async (job) => {
    const { type, userId, data, channels } = job.data;
    
    try {
      // Process notification based on channels
      if (channels.includes("push")) {
        // TODO: Send push notification
        logger.debug(`Push notification sent to ${userId}`);
      }
      
      if (channels.includes("email")) {
        // TODO: Send email notification
        logger.debug(`Email notification sent to ${userId}`);
      }
      
      if (channels.includes("in-app")) {
        // Store in-app notification
        // TODO: Import Notification model and create
        logger.debug(`In-app notification created for ${userId}`);
      }
      
    } catch (err) {
      logger.error(`Failed to process notification:`, err.message);
      throw err;
    }
  });
  
  return queue;
};

/**
 * Queue a notification
 */
export const queueNotification = async (userId, type, data, channels = ["in-app"]) => {
  const queue = queues[NOTIFICATIONS_QUEUE];
  
  if (!queue) {
    logger.warn(`Cannot queue notification: queue not available`);
    return null;
  }
  
  try {
    const job = await queue.add("sendNotification", {
      userId,
      type,
      data,
      channels,
      timestamp: Date.now(),
    });
    
    return job.id;
  } catch (err) {
    logger.error(`Failed to queue notification:`, err.message);
    return null;
  }
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize all queues and workers
 */
export const initQueues = async () => {
  if (!isRedisConnected()) {
    logger.warn("⚠️ Queues not initialized: Redis not connected");
    return false;
  }
  
  initEventsQueue();
  initNotificationsQueue();
  
  logger.info("✅ All queues initialized");
  return true;
};

/**
 * Graceful shutdown
 */
export const shutdownQueues = async () => {
  logger.info("Shutting down queues...");
  
  for (const [name, worker] of Object.entries(workers)) {
    await worker.close();
    logger.debug(`Worker ${name} closed`);
  }
  
  for (const [name, queue] of Object.entries(queues)) {
    await queue.close();
    logger.debug(`Queue ${name} closed`);
  }
  
  logger.info("All queues shut down");
};

export default {
  createQueue,
  createWorker,
  initQueues,
  shutdownQueues,
  logEvent,
  queueNotification,
};




