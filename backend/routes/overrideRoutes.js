// routes/overrideRoutes.js
import express from "express";
import { restartBackend } from "../utils/systemOverride.js";

const router = Router();

router.post("/reboot", (req, res) => {
  restartBackend();
  res
    .status(200)
    .json({ message: "Override triggered, attempting backend reboot..." });
});

export default router;
