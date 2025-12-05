// backend/controllers/coinController.js
// DEPRECATED: This controller is part of the LEGACY architecture.
// Runtime traffic is being migrated to /backend/src/api/controllers/coins.controller.js
// Do NOT add new features here.
import { User, CoinTransaction, Post as FeedPost } from "../src/domain/models/index.js";

/**
 * Buy coins (mocked payment)
 * POST /api/coins/buy
 * Body: { amount: number }
 */
export async function buyCoins(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { amount } = req.body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ ok: false, message: "Invalid amount" });
    }

    // Mock: Just increase balance (no real payment processing)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    // Ensure coinBalance exists (default to 0)
    if (typeof user.coinBalance !== "number") {
      user.coinBalance = 0;
    }

    const oldBalance = user.coinBalance;
    user.coinBalance += amount;
    await user.save();

    // Create transaction record
    await CoinTransaction.create({
      type: "deposit",
      amount,
      toUserId: userId,
      meta: {
        paymentMethod: "mock",
        oldBalance,
        newBalance: user.coinBalance,
      },
    });

    res.json({
      ok: true,
      coinBalance: user.coinBalance,
      amountAdded: amount,
    });
  } catch (err) {
    console.error("Error buying coins:", err);
    res.status(500).json({ ok: false, message: "Failed to buy coins", error: err.message });
  }
}

/**
 * Tip a creator on a feed post
 * POST /api/coins/tip
 * Body: { postId: string, amount: number }
 */
export async function tipCreator(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const { postId, amount } = req.body;
    if (!postId) {
      return res.status(400).json({ ok: false, message: "postId is required" });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ ok: false, message: "Invalid tip amount" });
    }

    // Get post to find creator
    const post = await FeedPost.findById(postId);
    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found" });
    }

    // Get creator user ID from post
    const creatorUserId = post.userId;
    if (!creatorUserId) {
      return res.status(400).json({ ok: false, message: "Post creator not found" });
    }

    // Prevent self-tipping
    if (String(creatorUserId) === String(userId)) {
      return res.status(400).json({ ok: false, message: "Cannot tip yourself" });
    }

    // Check if user has enough coins
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    if (typeof user.coinBalance !== "number") {
      user.coinBalance = 0;
    }

    if (user.coinBalance < amount) {
      return res.status(400).json({ ok: false, message: "Insufficient coins" });
    }

    // Get creator user
    const creator = await User.findById(creatorUserId);
    if (!creator) {
      return res.status(404).json({ ok: false, message: "Creator not found" });
    }

    if (typeof creator.coinBalance !== "number") {
      creator.coinBalance = 0;
    }

    // Transfer coins
    user.coinBalance -= amount;
    creator.coinBalance += amount;
    await user.save();
    await creator.save();

    // Create transaction records
    await CoinTransaction.create({
      type: "tip",
      amount,
      fromUserId: userId,
      toUserId: creatorUserId,
      meta: {
        postId: post._id.toString(),
        postTitle: post.content?.substring(0, 50) || "Feed Post",
      },
    });

    res.json({
      ok: true,
      coinBalance: user.coinBalance,
      tippedAmount: amount,
      message: `Tipped ${amount} coins to ${post.authorName || "creator"}`,
    });
  } catch (err) {
    console.error("Error tipping creator:", err);
    res.status(500).json({ ok: false, message: "Failed to tip creator", error: err.message });
  }
}

export default {
  buyCoins,
  tipCreator,
};

