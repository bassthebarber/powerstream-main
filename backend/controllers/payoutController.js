// backend/controllers/payoutController.js
import mongoose from 'mongoose';
import PayoutRequest from '../models/payoutModel.js';

const asObjectId = (v) => {
  try { return new mongoose.Types.ObjectId(v); } catch { return null; }
};

const parseAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * POST /api/payouts
 * Body: { amount: number, method?: 'paypal'|'stripe'|'manual' }
 */
export const createPayoutRequest = async (req, res) => {
  try {
    const userId = req?.user?.id || req?.user?._id || req?.body?.userId;
    const _user = asObjectId(userId);
    const amount = parseAmount(req.body?.amount);
    const method = (req.body?.method || 'paypal').toLowerCase();

    if (!_user) {
      return res.status(401).json({ error: 'Not authorized or missing user' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const payout = await PayoutRequest.create({
      user: _user,
      amount,
      method,
      status: 'pending',
      requestedAt: new Date()
    });

    return res.status(201).json(payout);
  } catch (err) {
    console.error('createPayoutRequest error:', err);
    return res.status(500).json({ error: 'Failed to request payout' });
  }
};

/**
 * GET /api/payouts
 * Optional query: ?status=pending|approved|rejected
 */
export const getAllPayoutRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query?.status) filter.status = req.query.status;

    const payouts = await PayoutRequest
      .find(filter)
      .sort({ requestedAt: -1 })
      .populate('user', 'name email');

    return res.json(payouts);
  } catch (err) {
    console.error('getAllPayoutRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch payout requests' });
  }
};

/**
 * GET /api/payouts/mine
 * Returns current user’s payout requests
 */
export const getMyPayoutRequests = async (req, res) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const _user = asObjectId(userId);
    if (!_user) return res.status(401).json({ error: 'Not authorized' });

    const payouts = await PayoutRequest
      .find({ user: _user })
      .sort({ requestedAt: -1 });

    return res.json(payouts);
  } catch (err) {
    console.error('getMyPayoutRequests error:', err);
    return res.status(500).json({ error: 'Failed to fetch your payout requests' });
  }
};

/**
 * GET /api/payouts/:id
 */
export const getPayoutById = async (req, res) => {
  try {
    const payout = await PayoutRequest
      .findById(req.params.id)
      .populate('user', 'name email');
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    return res.json(payout);
  } catch (err) {
    console.error('getPayoutById error:', err);
    return res.status(500).json({ error: 'Failed to fetch payout' });
  }
};

/**
 * POST /api/payouts/:id/approve
 */
export const approvePayout = async (req, res) => {
  try {
    const payout = await PayoutRequest.findById(req.params.id);
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    if (payout.status === 'approved')
      return res.status(409).json({ error: 'Payout already approved' });
    if (payout.status === 'rejected')
      return res.status(409).json({ error: 'Payout already rejected' });

    payout.status = 'approved';
    payout.approvedAt = new Date();
    payout.approvedBy = req?.user?.id || req?.user?._id || null;

    await payout.save();
    return res.json({ message: 'Payout approved', payout });
  } catch (err) {
    console.error('approvePayout error:', err);
    return res.status(500).json({ error: 'Failed to approve payout' });
  }
};

/**
 * POST /api/payouts/:id/reject
 * Body: { reason?: string }
 */
export const rejectPayout = async (req, res) => {
  try {
    const payout = await PayoutRequest.findById(req.params.id);
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    if (payout.status === 'approved')
      return res.status(409).json({ error: 'Payout already approved' });
    if (payout.status === 'rejected')
      return res.status(409).json({ error: 'Payout already rejected' });

    payout.status = 'rejected';
    payout.rejectedAt = new Date();
    payout.rejectedBy = req?.user?.id || req?.user?._id || null;
    payout.rejectReason = req.body?.reason || 'unspecified';

    await payout.save();
    return res.json({ message: 'Payout rejected', payout });
  } catch (err) {
    console.error('rejectPayout error:', err);
    return res.status(500).json({ error: 'Failed to reject payout' });
  }
};
