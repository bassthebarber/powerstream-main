// backend/routes/engineerAccessRoutes.js
// Engineer/Producer Access Code Management
import { Router } from "express";
import EngineerAccessCode from "../models/EngineerAccessCode.js";
import { requireAuth, authOptional } from "../middleware/requireAuth.js";

const router = Router();

// Allowed labels for admin access
const ADMIN_LABELS = ["no-limit-east-houston", "no-limit-forever", "southern-power"];

/**
 * Check if user is a label admin
 */
const isLabelAdmin = (user, labelSlug) => {
  if (!user) return false;
  if (user.isAdmin || user.role === "admin") return true;
  // Check if user is owner of this label
  if (user.ownedLabels?.includes(labelSlug)) return true;
  // Check email patterns for No Limit admins
  if (labelSlug.includes("no-limit") && 
      (user.email?.includes("nolimit") || user.email?.includes("marcus"))) {
    return true;
  }
  return false;
};

/**
 * Health check
 */
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "engineer-access", timestamp: new Date() });
});

/**
 * Generate a new access code (Admin only)
 * POST /api/engineer/codes/generate
 */
router.post("/codes/generate", requireAuth, async (req, res) => {
  try {
    const { labelSlug = "no-limit-east-houston", role = "engineer", assignedName, permissions } = req.body;
    
    // Check admin access
    if (!isLabelAdmin(req.user, labelSlug)) {
      return res.status(403).json({ 
        ok: false, 
        error: "Only label administrators can generate access codes" 
      });
    }
    
    // Generate unique code
    let code;
    let attempts = 0;
    while (attempts < 10) {
      code = EngineerAccessCode.generateCode();
      const existing = await EngineerAccessCode.findOne({ code });
      if (!existing) break;
      attempts++;
    }
    
    if (attempts >= 10) {
      return res.status(500).json({ ok: false, error: "Could not generate unique code" });
    }
    
    // Default permissions based on role
    const defaultPerms = {
      engineer: { canMix: true, canMaster: false, canExport: true, canDeleteTakes: false, canAccessAI: false, canControlSession: true },
      producer: { canMix: true, canMaster: false, canExport: true, canDeleteTakes: true, canAccessAI: true, canControlSession: true },
      mixer: { canMix: true, canMaster: false, canExport: true, canDeleteTakes: false, canAccessAI: false, canControlSession: true },
      master_engineer: { canMix: true, canMaster: true, canExport: true, canDeleteTakes: false, canAccessAI: true, canControlSession: true },
      full_access: { canMix: true, canMaster: true, canExport: true, canDeleteTakes: true, canAccessAI: true, canControlSession: true, canInviteOthers: true },
    };
    
    const accessCode = await EngineerAccessCode.create({
      code,
      labelSlug,
      createdBy: req.user.id,
      role,
      assignedName: assignedName || "",
      permissions: permissions || defaultPerms[role] || defaultPerms.engineer,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    console.log(`[EngineerAccess] Code generated: ${code} for ${labelSlug} by ${req.user.email}`);
    
    res.json({
      ok: true,
      code: accessCode.code,
      role: accessCode.role,
      permissions: accessCode.permissions,
      expiresAt: accessCode.expiresAt,
      message: `Access code generated for ${role}`,
    });
    
  } catch (err) {
    console.error("[EngineerAccess] Generate error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * List all codes for a label (Admin only)
 * GET /api/engineer/codes
 */
router.get("/codes", requireAuth, async (req, res) => {
  try {
    const { labelSlug = "no-limit-east-houston" } = req.query;
    
    if (!isLabelAdmin(req.user, labelSlug)) {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }
    
    const codes = await EngineerAccessCode.find({ labelSlug })
      .populate("createdBy", "username email")
      .populate("usedBy", "username email")
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ ok: true, codes, total: codes.length });
    
  } catch (err) {
    console.error("[EngineerAccess] List error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Validate and plug in with access code
 * POST /api/engineer/plug-in
 */
router.post("/plug-in", authOptional, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({ ok: false, error: "Invalid access code format" });
    }
    
    const accessCode = await EngineerAccessCode.findOne({ 
      code: code.toUpperCase(),
      status: "active"
    });
    
    if (!accessCode) {
      return res.status(404).json({ ok: false, error: "Invalid or expired access code" });
    }
    
    if (!accessCode.isValid()) {
      return res.status(400).json({ ok: false, error: "Access code has expired" });
    }
    
    // Mark as used
    accessCode.usedAt = new Date();
    accessCode.usedBy = req.user?.id || null;
    accessCode.activeSession = {
      sessionId: `session_${Date.now()}`,
      pluggedInAt: new Date(),
      lastActivity: new Date(),
    };
    await accessCode.save();
    
    console.log(`[EngineerAccess] Plug-in successful: ${code} by ${req.user?.email || "anonymous"}`);
    
    res.json({
      ok: true,
      pluggedIn: true,
      role: accessCode.role,
      labelSlug: accessCode.labelSlug,
      permissions: accessCode.permissions,
      sessionId: accessCode.activeSession.sessionId,
      assignedName: accessCode.assignedName,
      message: `Welcome, ${accessCode.role}! You're now plugged into the studio.`,
    });
    
  } catch (err) {
    console.error("[EngineerAccess] Plug-in error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Revoke an access code (Admin only)
 * DELETE /api/engineer/codes/:code
 */
router.delete("/codes/:code", requireAuth, async (req, res) => {
  try {
    const { code } = req.params;
    
    const accessCode = await EngineerAccessCode.findOne({ code: code.toUpperCase() });
    
    if (!accessCode) {
      return res.status(404).json({ ok: false, error: "Code not found" });
    }
    
    if (!isLabelAdmin(req.user, accessCode.labelSlug)) {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }
    
    accessCode.status = "revoked";
    await accessCode.save();
    
    console.log(`[EngineerAccess] Code revoked: ${code} by ${req.user.email}`);
    
    res.json({ ok: true, message: "Access code revoked" });
    
  } catch (err) {
    console.error("[EngineerAccess] Revoke error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Check current plug-in status
 * GET /api/engineer/status
 */
router.get("/status", authOptional, async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.json({ ok: true, pluggedIn: false });
    }
    
    const accessCode = await EngineerAccessCode.findOne({ 
      "activeSession.sessionId": sessionId,
      status: { $in: ["active", "used"] }
    });
    
    if (!accessCode) {
      return res.json({ ok: true, pluggedIn: false, expired: true });
    }
    
    // Update last activity
    accessCode.activeSession.lastActivity = new Date();
    await accessCode.save();
    
    res.json({
      ok: true,
      pluggedIn: true,
      role: accessCode.role,
      permissions: accessCode.permissions,
      labelSlug: accessCode.labelSlug,
    });
    
  } catch (err) {
    console.error("[EngineerAccess] Status error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Unplug from session
 * POST /api/engineer/unplug
 */
router.post("/unplug", authOptional, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.json({ ok: true, message: "Already unplugged" });
    }
    
    const accessCode = await EngineerAccessCode.findOne({ 
      "activeSession.sessionId": sessionId 
    });
    
    if (accessCode) {
      accessCode.activeSession = null;
      await accessCode.save();
    }
    
    res.json({ ok: true, message: "Successfully unplugged from studio" });
    
  } catch (err) {
    console.error("[EngineerAccess] Unplug error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;


