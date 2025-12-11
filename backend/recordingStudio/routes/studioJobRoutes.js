// backend/recordingStudio/routes/studioJobRoutes.js
// Studio Job & Contract API Routes
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole, requireEngineer, requireAdmin, ROLES } from "../middleware/requireRole.js";
import contractEngine from "../services/contractEngine.js";
import StudioJob, { JOB_TYPES, JOB_STATUS, DEFAULT_PRICING } from "../models/StudioJob.js";
import StudioContract, { CONTRACT_STATUS } from "../models/StudioContract.js";

const router = express.Router();

// ============================================================
// GET DEFAULT PRICING FOR ALL JOB TYPES
// GET /api/studio/jobs/pricing
// ============================================================
router.get("/pricing", async (req, res) => {
  try {
    const prices = contractEngine.getDefaultPrices();
    res.json({
      ok: true,
      prices,
      jobTypes: Object.values(JOB_TYPES),
    });
  } catch (error) {
    console.error("Error getting pricing:", error);
    res.status(500).json({ ok: false, error: "Failed to get pricing" });
  }
});

// ============================================================
// GET PRICING BREAKDOWN FOR A SPECIFIC JOB TYPE
// GET /api/studio/jobs/pricing/:type
// ============================================================
router.get("/pricing/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { customPrice, platformFeePercent } = req.query;

    const breakdown = contractEngine.getPricingBreakdown(
      type,
      customPrice ? parseInt(customPrice) : null,
      platformFeePercent ? parseFloat(platformFeePercent) : null
    );

    res.json({
      ok: true,
      breakdown,
    });
  } catch (error) {
    console.error("Error getting pricing breakdown:", error);
    res.status(500).json({ ok: false, error: "Failed to get pricing breakdown" });
  }
});

// ============================================================
// CREATE A NEW STUDIO JOB
// POST /api/studio/jobs/create
// ============================================================
router.post("/create", requireAuth, async (req, res) => {
  try {
    const {
      sessionId,
      studioSessionId,
      engineerId,
      type,
      title,
      description,
      basePrice,
      platformFeePercent,
      includesRoyalties,
      royaltyPercent,
      inputFiles,
      dueDate,
      maxRevisions,
    } = req.body;

    const artistId = req.user.id || req.user._id;

    // Validate job type
    if (!type || !Object.values(JOB_TYPES).includes(type)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid job type. Valid types: ${Object.values(JOB_TYPES).join(", ")}`,
      });
    }

    const job = await contractEngine.createStudioJob({
      sessionId,
      studioSessionId,
      artistId,
      engineerId,
      type,
      title,
      description,
      basePrice,
      platformFeePercent,
      includesRoyalties,
      royaltyPercent,
      inputFiles,
      dueDate,
      maxRevisions,
    });

    res.status(201).json({
      ok: true,
      message: "Studio job created",
      job: {
        id: job._id,
        type: job.type,
        title: job.title,
        status: job.status,
        pricing: job.getPricingSummary(),
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to create job" });
  }
});

// ============================================================
// GET USER'S JOBS (as artist)
// GET /api/studio/jobs/my-jobs
// ============================================================
router.get("/my-jobs", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status, type, limit = 20, page = 1 } = req.query;

    const query = { artistId: userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await StudioJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("engineerId", "name email avatarUrl");

    const total = await StudioJob.countDocuments(query);

    res.json({
      ok: true,
      jobs: jobs.map(j => ({
        id: j._id,
        type: j.type,
        title: j.title,
        status: j.status,
        engineer: j.engineerId,
        pricing: j.getPricingSummary(),
        createdAt: j.createdAt,
        dueDate: j.dueDate,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ ok: false, error: "Failed to get jobs" });
  }
});

// ============================================================
// GET ENGINEER'S ASSIGNED JOBS
// GET /api/studio/jobs/engineer-jobs
// ============================================================
router.get("/engineer-jobs", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status, type, limit = 20, page = 1 } = req.query;

    const query = { engineerId: userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await StudioJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("artistId", "name email avatarUrl");

    const total = await StudioJob.countDocuments(query);

    res.json({
      ok: true,
      jobs: jobs.map(j => ({
        id: j._id,
        type: j.type,
        title: j.title,
        status: j.status,
        artist: j.artistId,
        pricing: j.getPricingSummary(),
        deliverables: j.deliverables,
        revisionCount: j.revisionCount,
        maxRevisions: j.maxRevisions,
        createdAt: j.createdAt,
        dueDate: j.dueDate,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting engineer jobs:", error);
    res.status(500).json({ ok: false, error: "Failed to get engineer jobs" });
  }
});

// ============================================================
// GET OPEN JOBS (for engineers to pick up)
// GET /api/studio/jobs/open
// ============================================================
router.get("/open", requireAuth, requireEngineer, async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    const query = { status: JOB_STATUS.OPEN };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await StudioJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("artistId", "name email avatarUrl");

    const total = await StudioJob.countDocuments(query);

    res.json({
      ok: true,
      jobs: jobs.map(j => ({
        id: j._id,
        type: j.type,
        title: j.title,
        description: j.description,
        artist: j.artistId,
        pricing: j.getPricingSummary(),
        inputFiles: j.inputFiles,
        dueDate: j.dueDate,
        createdAt: j.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting open jobs:", error);
    res.status(500).json({ ok: false, error: "Failed to get open jobs" });
  }
});

// ============================================================
// GET JOB DETAILS
// GET /api/studio/jobs/:jobId
// ============================================================
router.get("/:jobId", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id || req.user._id;

    const job = await StudioJob.findById(jobId)
      .populate("artistId", "name email avatarUrl")
      .populate("engineerId", "name email avatarUrl")
      .populate("sessionId")
      .populate("contractId");

    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Check if user is participant or admin
    const isParticipant = 
      job.artistId._id.toString() === userId.toString() ||
      job.engineerId?._id.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    res.json({
      ok: true,
      job: {
        id: job._id,
        type: job.type,
        title: job.title,
        description: job.description,
        status: job.status,
        artist: job.artistId,
        engineer: job.engineerId,
        session: job.sessionId,
        contract: job.contractId,
        pricing: job.getPricingSummary(),
        inputFiles: job.inputFiles,
        deliverables: job.deliverables,
        revisionCount: job.revisionCount,
        maxRevisions: job.maxRevisions,
        revisionNotes: job.revisionNotes,
        dueDate: job.dueDate,
        startedAt: job.startedAt,
        deliveredAt: job.deliveredAt,
        approvedAt: job.approvedAt,
        paidAt: job.paidAt,
        artistNotes: job.artistNotes,
        engineerNotes: job.engineerNotes,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting job:", error);
    res.status(500).json({ ok: false, error: "Failed to get job" });
  }
});

// ============================================================
// ASSIGN ENGINEER TO JOB
// POST /api/studio/jobs/:jobId/assign
// ============================================================
router.post("/:jobId/assign", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { engineerId } = req.body;
    const userId = req.user.id || req.user._id;
    const userRoles = req.user.roles || [];

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Check permissions
    const isArtist = job.artistId.toString() === userId.toString();
    const isAdmin = userRoles.includes(ROLES.ADMIN);
    const isSelfAssign = engineerId === userId.toString() || !engineerId;

    if (!isArtist && !isAdmin && !isSelfAssign) {
      return res.status(403).json({ ok: false, error: "Not authorized to assign engineer" });
    }

    // For self-assignment, check if user is an engineer
    if (isSelfAssign && !userRoles.includes(ROLES.ENGINEER) && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Only engineers can self-assign" });
    }

    await job.assignEngineer(engineerId || userId);

    res.json({
      ok: true,
      message: "Engineer assigned",
      job: {
        id: job._id,
        status: job.status,
        engineerId: job.engineerId,
      },
    });
  } catch (error) {
    console.error("Error assigning engineer:", error);
    res.status(500).json({ ok: false, error: "Failed to assign engineer" });
  }
});

// ============================================================
// SUBMIT DELIVERABLE
// POST /api/studio/jobs/:jobId/deliver
// ============================================================
router.post("/:jobId/deliver", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, url, type, notes } = req.body;
    const userId = req.user.id || req.user._id;

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Only engineer can deliver
    if (job.engineerId?.toString() !== userId.toString()) {
      return res.status(403).json({ ok: false, error: "Only the assigned engineer can submit deliverables" });
    }

    if (!url) {
      return res.status(400).json({ ok: false, error: "Deliverable URL is required" });
    }

    await job.submitDeliverable({
      name: name || `Deliverable ${job.deliverables.length + 1}`,
      url,
      type: type || job.type,
    });

    if (notes) {
      job.engineerNotes = notes;
      await job.save();
    }

    res.json({
      ok: true,
      message: "Deliverable submitted",
      job: {
        id: job._id,
        status: job.status,
        deliverables: job.deliverables,
      },
    });
  } catch (error) {
    console.error("Error submitting deliverable:", error);
    res.status(500).json({ ok: false, error: "Failed to submit deliverable" });
  }
});

// ============================================================
// REQUEST REVISION
// POST /api/studio/jobs/:jobId/revision
// ============================================================
router.post("/:jobId/revision", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { note } = req.body;
    const userId = req.user.id || req.user._id;

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Only artist can request revision
    if (job.artistId.toString() !== userId.toString()) {
      return res.status(403).json({ ok: false, error: "Only the artist can request revisions" });
    }

    if (!note) {
      return res.status(400).json({ ok: false, error: "Revision note is required" });
    }

    await job.requestRevision(note, userId);

    res.json({
      ok: true,
      message: "Revision requested",
      job: {
        id: job._id,
        status: job.status,
        revisionCount: job.revisionCount,
        maxRevisions: job.maxRevisions,
        revisionNotes: job.revisionNotes,
      },
    });
  } catch (error) {
    console.error("Error requesting revision:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to request revision" });
  }
});

// ============================================================
// APPROVE JOB
// POST /api/studio/jobs/:jobId/approve
// ============================================================
router.post("/:jobId/approve", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id || req.user._id;

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Only artist can approve
    if (job.artistId.toString() !== userId.toString()) {
      return res.status(403).json({ ok: false, error: "Only the artist can approve the job" });
    }

    if (job.status !== JOB_STATUS.DELIVERED) {
      return res.status(400).json({ ok: false, error: "Can only approve delivered jobs" });
    }

    await job.approve();

    res.json({
      ok: true,
      message: "Job approved",
      job: {
        id: job._id,
        status: job.status,
        approvedAt: job.approvedAt,
      },
    });
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ ok: false, error: "Failed to approve job" });
  }
});

// ============================================================
// COMPLETE JOB (trigger payment)
// POST /api/studio/jobs/:jobId/complete
// ============================================================
router.post("/:jobId/complete", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id || req.user._id;
    const userRoles = req.user.roles || [];

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Only artist or admin can complete
    const isArtist = job.artistId.toString() === userId.toString();
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    if (!isArtist && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Only the artist or admin can complete the job" });
    }

    const result = await contractEngine.completeJob(jobId);

    res.json({
      ok: true,
      message: "Job completed and payment processed",
      job: {
        id: result.job._id,
        status: result.job.status,
        paidAt: result.job.paidAt,
      },
      summary: result.summary,
      // transactions: result.transactions, // Don't expose full transaction details
    });
  } catch (error) {
    console.error("Error completing job:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to complete job" });
  }
});

// ============================================================
// CANCEL JOB
// POST /api/studio/jobs/:jobId/cancel
// ============================================================
router.post("/:jobId/cancel", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id || req.user._id;
    const userRoles = req.user.roles || [];

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    // Check permissions
    const isArtist = job.artistId.toString() === userId.toString();
    const isEngineer = job.engineerId?.toString() === userId.toString();
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    if (!isArtist && !isEngineer && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Not authorized to cancel this job" });
    }

    await contractEngine.cancelJob(jobId, reason);

    res.json({
      ok: true,
      message: "Job cancelled",
      job: {
        id: job._id,
        status: JOB_STATUS.CANCELLED,
      },
    });
  } catch (error) {
    console.error("Error cancelling job:", error);
    res.status(500).json({ ok: false, error: "Failed to cancel job" });
  }
});

// ============================================================
// UPDATE JOB STATUS (Admin only)
// PATCH /api/studio/jobs/:jobId/status
// ============================================================
router.patch("/:jobId/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, adminNotes } = req.body;

    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    if (!Object.values(JOB_STATUS).includes(status)) {
      return res.status(400).json({ 
        ok: false, 
        error: `Invalid status. Valid values: ${Object.values(JOB_STATUS).join(", ")}` 
      });
    }

    job.status = status;
    if (adminNotes) job.adminNotes = adminNotes;
    await job.save();

    res.json({
      ok: true,
      message: "Job status updated",
      job: {
        id: job._id,
        status: job.status,
      },
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ ok: false, error: "Failed to update job status" });
  }
});

// ============================================================
// GET JOB STATISTICS (Admin)
// GET /api/studio/jobs/stats
// ============================================================
router.get("/stats/overview", requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await contractEngine.getJobStatistics();

    res.json({
      ok: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ ok: false, error: "Failed to get statistics" });
  }
});

export default router;



