import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

router.post('/supabaseUser', async (req, res) => {
  const { id, email, user_metadata } = req.body;

  try {
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    await collection.updateOne(
      { supabaseId: id },
      { $set: { email, user_metadata, updatedAt: new Date() } },
      { upsert: true }
    );

    res.status(200).json({ ok: true, synced: true });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
