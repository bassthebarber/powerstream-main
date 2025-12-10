// backend/src/api/controllers/events.controller.js
// Canonical events controller - handles event logging and analytics
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const eventsController = {
  /**
   * POST /api/events
   * Log a client-side event
   */
  async logEvent(req, res, next) {
    try {
      const userId = req.user?.id; // May be null for anonymous events
      const { eventType, entityType, entityId, metadata } = req.body;

      if (!eventType) {
        return res.status(400).json({ message: "Event type is required" });
      }

      // Add client context
      const enrichedMetadata = {
        ...metadata,
        userAgent: req.headers["user-agent"],
        clientIp: req.ip,
        referrer: req.headers.referer,
        sessionId: req.headers["x-session-id"],
      };

      await eventsService.logEvent(
        userId || "anonymous",
        eventType,
        entityType || "app",
        entityId,
        enrichedMetadata
      );

      res.status(201).json({ success: true });
    } catch (error) {
      logger.error("Error logging event:", error);
      next(error);
    }
  },

  /**
   * POST /api/events/batch
   * Log multiple events at once
   */
  async logBatch(req, res, next) {
    try {
      const userId = req.user?.id;
      const { events } = req.body;

      if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ message: "Events array is required" });
      }

      // Limit batch size
      const maxBatch = 100;
      const eventsToProcess = events.slice(0, maxBatch);

      const results = await Promise.allSettled(
        eventsToProcess.map((event) =>
          eventsService.logEvent(
            userId || event.userId || "anonymous",
            event.eventType,
            event.entityType || "app",
            event.entityId,
            {
              ...event.metadata,
              userAgent: req.headers["user-agent"],
              clientIp: req.ip,
            }
          )
        )
      );

      const logged = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      res.status(201).json({
        success: true,
        logged,
        failed,
        total: eventsToProcess.length,
      });
    } catch (error) {
      logger.error("Error logging batch events:", error);
      next(error);
    }
  },

  /**
   * GET /api/events/my
   * Get user's own event history (limited)
   */
  async getMyEvents(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const eventType = req.query.type;

      const events = await eventsService.getUserEvents(userId, {
        page,
        limit,
        eventType,
      });

      res.json({
        success: true,
        events,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting my events:", error);
      next(error);
    }
  },

  /**
   * GET /api/events/stats
   * Get event statistics (for analytics dashboard)
   */
  async getStats(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;

      // This endpoint might be admin-only in production
      const stats = await eventsService.getEventStats({
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
        groupBy: groupBy || "day",
      });

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error("Error getting event stats:", error);
      next(error);
    }
  },

  /**
   * POST /api/events/view
   * Log a view event (shorthand)
   */
  async logView(req, res, next) {
    try {
      const userId = req.user?.id;
      const { entityType, entityId, metadata } = req.body;

      if (!entityType || !entityId) {
        return res.status(400).json({ message: "Entity type and ID are required" });
      }

      await eventsService.logView(userId || "anonymous", entityType, entityId, metadata);

      res.status(201).json({ success: true });
    } catch (error) {
      logger.error("Error logging view:", error);
      next(error);
    }
  },

  /**
   * POST /api/events/click
   * Log a click event (shorthand)
   */
  async logClick(req, res, next) {
    try {
      const userId = req.user?.id;
      const { entityType, entityId, metadata } = req.body;

      await eventsService.logEvent(
        userId || "anonymous",
        "click",
        entityType || "ui",
        entityId,
        metadata
      );

      res.status(201).json({ success: true });
    } catch (error) {
      logger.error("Error logging click:", error);
      next(error);
    }
  },
};

export default eventsController;




