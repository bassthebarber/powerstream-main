// backend/routes/hlsRoutes.js
import express from 'express';
import path from 'path';
const router = Router();

router.get('/:type/:id/:filename', (req, res) => {
  const { type, id, filename } = req.params;
  const folder = type === 'live' ? 'live-streams' : 'recordings';
  const filePath = path.join(`./media/${folder}/${id}/${filename}`);
  res.sendFile(filePath, { root: '.' });
});

export default router;
