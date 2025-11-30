// /backend/routes/artistMediaRoutes.js
import express from 'express';
const router = Router();

// Example GET route
router.get('/artist/:id', (req, res) => {
  res.json({ message: `Fetching media for artist ID ${req.params.id}` });
});

export default router;
