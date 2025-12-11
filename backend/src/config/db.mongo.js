// backend/src/config/db.mongo.js
// MongoDB connection with retry logic and event handling
import mongoose from "mongoose";
import env, { buildMongoUri } from "./env.js";
import { logger } from "./logger.js";

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000;

let retryCount = 0;
let isConnecting = false;

/**
 * MongoDB connection options
 */
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4
};

/**
 * Connect to MongoDB with retry logic
 */
export const connectMongo = async () => {
  const uri = buildMongoUri();
  
  if (!uri) {
    logger.warn("⚠️ No MongoDB URI available - server will start WITHOUT database");
    return false;
  }
  
  if (isConnecting) {
    logger.info("MongoDB connection already in progress...");
    return false;
  }
  
  isConnecting = true;
  
  try {
    logger.info("🟡 MongoDB: Connecting...");
    mongoose.set("strictQuery", true);
    
    await mongoose.connect(uri, connectionOptions);
    
    logger.info("🟢 MongoDB: Connected successfully");
    retryCount = 0;
    isConnecting = false;
    return true;
  } catch (err) {
    isConnecting = false;
    retryCount++;
    
    logger.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);
    
    if (err?.reason?.codeName) {
      logger.error(`   codeName: ${err.reason.codeName}`);
    }
    
    if (retryCount < MAX_RETRIES) {
      logger.info(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectMongo();
    }
    
    logger.error("❌ Max retries reached. Server will continue without database.");
    return false;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectMongo = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  } catch (err) {
    logger.error("Error disconnecting from MongoDB:", err.message);
  }
};

/**
 * Get MongoDB connection state
 */
export const getMongoState = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return {
    state: states[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
    isConnected: mongoose.connection.readyState === 1,
  };
};

// Connection event handlers
mongoose.connection.on("connected", () => {
  logger.info("🟢 MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("🔄 MongoDB disconnected");
  if (!isConnecting && retryCount < MAX_RETRIES) {
    retryCount = 0;
    setTimeout(() => connectMongo(), RETRY_INTERVAL);
  }
});

mongoose.connection.on("error", (err) => {
  logger.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("reconnected", () => {
  logger.info("🟢 MongoDB reconnected");
});

export default { connectMongo, disconnectMongo, getMongoState };



