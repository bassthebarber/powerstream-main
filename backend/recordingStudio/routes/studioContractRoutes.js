// backend/recordingStudio/routes/studioContractRoutes.js
// Studio Contract API Routes
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole, requireAdmin, ROLES } from "../middleware/requireRole.js";
import contractEngine from "../services/contractEngine.js";
import StudioContract, { CONTRACT_STATUS } from "../models/StudioContract.js";
import StudioJob from "../models/StudioJob.js";

const router = express.Router();

// ============================================================
// GENERATE A CONTRACT FOR A JOB
// POST /api/studio/contracts/generate
// ============================================================
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { 
      jobId, 
      contractType, 
      title, 
      serviceDescription, 
      deliverables,
      expirationDate,
      revisionFee,
      cancellationFee,
      refundPercent,
    } = req.body;
    const userId = req.user.id || req.user._id;

    if (!jobId) {
      return res.status(400).json({ ok: false, error: "Job ID is required" });
    }

    // Check that user owns the job
    const job = await StudioJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, error: "Job not found" });
    }

    const isArtist = job.artistId.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isArtist && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Only the artist or admin can generate a contract" });
    }

    // Check if contract already exists
    if (job.contractId) {
      const existingContract = await StudioContract.findById(job.contractId);
      if (existingContract && existingContract.status !== CONTRACT_STATUS.CANCELLED) {
        return res.status(400).json({ 
          ok: false, 
          error: "A contract already exists for this job",
          contractId: existingContract._id,
        });
      }
    }

    const contract = await contractEngine.generateStudioContract(jobId, {
      contractType,
      title,
      serviceDescription,
      deliverables,
      expirationDate,
      revisionFee,
      cancellationFee,
      refundPercent,
    });

    res.status(201).json({
      ok: true,
      message: "Contract generated",
      contract: {
        id: contract._id,
        contractNumber: contract.contractNumber,
        type: contract.type,
        status: contract.status,
        title: contract.title,
        termsSummary: contract.termsSummary,
        pricing: contract.getPricingSummary(),
        createdAt: contract.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating contract:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to generate contract" });
  }
});

// ============================================================
// GET CONTRACT DETAILS
// GET /api/studio/contracts/:contractId
// ============================================================
router.get("/:contractId", requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id || req.user._id;

    const contract = await StudioContract.findById(contractId)
      .populate("jobId")
      .populate("artistId", "name email avatarUrl")
      .populate("engineerId", "name email avatarUrl");

    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }

    // Check permissions
    const isArtist = contract.artistId._id.toString() === userId.toString();
    const isEngineer = contract.engineerId?._id?.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isArtist && !isEngineer && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    res.json({
      ok: true,
      contract: {
        id: contract._id,
        contractNumber: contract.contractNumber,
        type: contract.type,
        status: contract.status,
        title: contract.title,
        terms: contract.terms,
        termsSummary: contract.termsSummary,
        structuredTerms: contract.structuredTerms,
        pricing: contract.pricing,
        pricingSummary: contract.getPricingSummary(),
        artist: contract.artistId,
        engineer: contract.engineerId,
        job: contract.jobId,
        signatures: {
          artist: {
            signed: contract.signatures.artist.signed,
            signedAt: contract.signatures.artist.signedAt,
          },
          engineer: {
            signed: contract.signatures.engineer.signed,
            signedAt: contract.signatures.engineer.signedAt,
          },
          platform: {
            signed: contract.signatures.platform.signed,
            signedAt: contract.signatures.platform.signedAt,
          },
        },
        governingLaw: contract.governingLaw,
        activatedAt: contract.activatedAt,
        completedAt: contract.completedAt,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting contract:", error);
    res.status(500).json({ ok: false, error: "Failed to get contract" });
  }
});

// ============================================================
// GET FULL CONTRACT TEXT
// GET /api/studio/contracts/:contractId/text
// ============================================================
router.get("/:contractId/text", requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id || req.user._id;

    const contract = await StudioContract.findById(contractId)
      .populate("artistId", "name email")
      .populate("engineerId", "name email");

    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }

    // Check permissions
    const isArtist = contract.artistId._id.toString() === userId.toString();
    const isEngineer = contract.engineerId?._id?.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isArtist && !isEngineer && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    // Regenerate contract text with current data
    const text = contract.generateContractText(contract.artistId, contract.engineerId);

    res.json({
      ok: true,
      contractNumber: contract.contractNumber,
      text,
    });
  } catch (error) {
    console.error("Error getting contract text:", error);
    res.status(500).json({ ok: false, error: "Failed to get contract text" });
  }
});

// ============================================================
// SIGN CONTRACT
// POST /api/studio/contracts/:contractId/sign
// ============================================================
router.post("/:contractId/sign", requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { signatureData } = req.body;
    const userId = req.user.id || req.user._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const contract = await StudioContract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }

    // Determine which party is signing
    const isArtist = contract.artistId.toString() === userId.toString();
    const isEngineer = contract.engineerId?.toString() === userId.toString();

    if (!isArtist && !isEngineer) {
      return res.status(403).json({ ok: false, error: "You are not a party to this contract" });
    }

    const party = isEngineer ? "engineer" : "artist";

    // Check if already signed
    if (contract.signatures[party].signed) {
      return res.status(400).json({ ok: false, error: `You have already signed this contract` });
    }

    // Sign the contract
    const signedContract = await contractEngine.signContract(contractId, party, {
      signatureData,
      ipAddress,
      userAgent,
    });

    res.json({
      ok: true,
      message: `Contract signed as ${party}`,
      contract: {
        id: signedContract._id,
        status: signedContract.status,
        signatures: {
          artist: {
            signed: signedContract.signatures.artist.signed,
            signedAt: signedContract.signatures.artist.signedAt,
          },
          engineer: {
            signed: signedContract.signatures.engineer.signed,
            signedAt: signedContract.signatures.engineer.signedAt,
          },
        },
        isFullySigned: signedContract.isFullySigned(),
        activatedAt: signedContract.activatedAt,
      },
    });
  } catch (error) {
    console.error("Error signing contract:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to sign contract" });
  }
});

// ============================================================
// ACTIVATE CONTRACT (after both signatures)
// POST /api/studio/contracts/:contractId/activate
// ============================================================
router.post("/:contractId/activate", requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id || req.user._id;

    const contract = await StudioContract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }

    // Check if user is a party
    const isArtist = contract.artistId.toString() === userId.toString();
    const isEngineer = contract.engineerId?.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isArtist && !isEngineer && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    const activatedContract = await contractEngine.activateContract(contractId);

    res.json({
      ok: true,
      message: "Contract activated",
      contract: {
        id: activatedContract._id,
        status: activatedContract.status,
        activatedAt: activatedContract.activatedAt,
      },
    });
  } catch (error) {
    console.error("Error activating contract:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to activate contract" });
  }
});

// ============================================================
// CANCEL CONTRACT
// POST /api/studio/contracts/:contractId/cancel
// ============================================================
router.post("/:contractId/cancel", requireAuth, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id || req.user._id;

    const contract = await StudioContract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }

    // Check permissions
    const isArtist = contract.artistId.toString() === userId.toString();
    const isEngineer = contract.engineerId?.toString() === userId.toString();
    const isAdmin = (req.user.roles || []).includes(ROLES.ADMIN);

    if (!isArtist && !isEngineer && !isAdmin) {
      return res.status(403).json({ ok: false, error: "Access denied" });
    }

    // Only draft/sent contracts can be cancelled easily
    if (contract.status === CONTRACT_STATUS.ACTIVE) {
      // Active contracts need special handling
      if (!isAdmin) {
        return res.status(400).json({ 
          ok: false, 
          error: "Active contracts require admin approval to cancel" 
        });
      }
    }

    await contract.cancel(reason);

    res.json({
      ok: true,
      message: "Contract cancelled",
      contract: {
        id: contract._id,
        status: CONTRACT_STATUS.CANCELLED,
      },
    });
  } catch (error) {
    console.error("Error cancelling contract:", error);
    res.status(500).json({ ok: false, error: "Failed to cancel contract" });
  }
});

// ============================================================
// GET USER'S CONTRACTS
// GET /api/studio/contracts
// ============================================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status, role = "artist", limit = 20, page = 1 } = req.query;

    const query = role === "engineer" 
      ? { engineerId: userId } 
      : { artistId: userId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contracts = await StudioContract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("jobId", "type title status")
      .populate("artistId", "name email avatarUrl")
      .populate("engineerId", "name email avatarUrl");

    const total = await StudioContract.countDocuments(query);

    res.json({
      ok: true,
      contracts: contracts.map(c => ({
        id: c._id,
        contractNumber: c.contractNumber,
        type: c.type,
        status: c.status,
        title: c.title,
        job: c.jobId,
        artist: c.artistId,
        engineer: c.engineerId,
        pricingSummary: c.getPricingSummary(),
        signatures: {
          artist: c.signatures.artist.signed,
          engineer: c.signatures.engineer.signed,
        },
        createdAt: c.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting contracts:", error);
    res.status(500).json({ ok: false, error: "Failed to get contracts" });
  }
});

// ============================================================
// GET PENDING CONTRACTS (need signature)
// GET /api/studio/contracts/pending
// ============================================================
router.get("/pending/list", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRoles = req.user.roles || [];

    // Find contracts where user hasn't signed yet
    const artistContracts = await StudioContract.find({
      artistId: userId,
      "signatures.artist.signed": false,
      status: { $in: [CONTRACT_STATUS.SENT, CONTRACT_STATUS.DRAFT, CONTRACT_STATUS.SIGNED_ENGINEER] },
    }).populate("jobId", "type title").populate("engineerId", "name");

    const engineerContracts = userRoles.includes(ROLES.ENGINEER)
      ? await StudioContract.find({
          engineerId: userId,
          "signatures.engineer.signed": false,
          status: { $in: [CONTRACT_STATUS.SENT, CONTRACT_STATUS.DRAFT, CONTRACT_STATUS.SIGNED_ARTIST] },
        }).populate("jobId", "type title").populate("artistId", "name")
      : [];

    res.json({
      ok: true,
      pendingAsArtist: artistContracts.map(c => ({
        id: c._id,
        contractNumber: c.contractNumber,
        type: c.type,
        status: c.status,
        title: c.title,
        job: c.jobId,
        engineer: c.engineerId,
        pricingSummary: c.getPricingSummary(),
        createdAt: c.createdAt,
      })),
      pendingAsEngineer: engineerContracts.map(c => ({
        id: c._id,
        contractNumber: c.contractNumber,
        type: c.type,
        status: c.status,
        title: c.title,
        job: c.jobId,
        artist: c.artistId,
        pricingSummary: c.getPricingSummary(),
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting pending contracts:", error);
    res.status(500).json({ ok: false, error: "Failed to get pending contracts" });
  }
});

// ============================================================
// ADMIN: GET ALL CONTRACTS
// GET /api/studio/contracts/admin/all
// ============================================================
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contracts = await StudioContract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("jobId", "type title status basePrice")
      .populate("artistId", "name email")
      .populate("engineerId", "name email");

    const total = await StudioContract.countDocuments(query);

    res.json({
      ok: true,
      contracts: contracts.map(c => ({
        id: c._id,
        contractNumber: c.contractNumber,
        type: c.type,
        status: c.status,
        title: c.title,
        job: c.jobId,
        artist: c.artistId,
        engineer: c.engineerId,
        pricing: c.pricing,
        signatures: {
          artist: c.signatures.artist.signed,
          engineer: c.signatures.engineer.signed,
        },
        createdAt: c.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting all contracts:", error);
    res.status(500).json({ ok: false, error: "Failed to get contracts" });
  }
});

export default router;




