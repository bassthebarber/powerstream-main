// backend/routes/deviceRoutes.js
import { Router } from "express";
import os from "os";

const router = Router();

/**
 * Quick health for this micro-slice.
 * GET /api/devices/health
 */
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "devices",
    ts: new Date().toISOString(),
  });
});

/**
 * Basic device/network info so you can “see” it’s alive.
 * GET /api/devices
 */
router.get("/", (req, res) => {
  const nets = os.networkInterfaces();
  const interfaces = Object.entries(nets).flatMap(([name, addrs]) =>
    (addrs || []).map((a) => ({
      name,
      address: a.address,
      family: a.family,
      internal: a.internal,
      mac: a.mac,
      netmask: a.netmask,
      cidr: a.cidr,
    }))
  );

  res.json({
    ok: true,
    message: "devices route alive",
    host: req.hostname,
    remoteIP: req.ip,
    interfaces,
  });
});

export default router;
