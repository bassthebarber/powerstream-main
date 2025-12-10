// frontend/src/api/coinsApi.js
// PowerCoins API client
import httpClient from "./httpClient.js";

/**
 * Coins API
 */
const coinsApi = {
  // ============================================================
  // BALANCE & TRANSACTIONS
  // ============================================================

  /**
   * Get user's coin balance
   */
  async getBalance() {
    const response = await httpClient.get("/coins/balance");
    return response.data;
  },

  /**
   * Get transaction history
   */
  async getTransactions(options = {}) {
    const { limit = 50, skip = 0, type } = options;
    const params = new URLSearchParams({ limit, skip });
    if (type) params.append("type", type);
    
    const response = await httpClient.get(`/coins/transactions?${params}`);
    return response.data;
  },

  /**
   * Get earnings summary
   */
  async getEarningsSummary(period = "all") {
    const response = await httpClient.get(`/coins/earnings?period=${period}`);
    return response.data;
  },

  // ============================================================
  // TIPPING
  // ============================================================

  /**
   * Send a tip to another user
   */
  async sendTip(toUserId, amount, context = {}) {
    const response = await httpClient.post("/coins/tip", {
      toUserId,
      amount,
      context,
    });
    return response.data;
  },

  /**
   * Tip on a post
   */
  async tipPost(postId, amount) {
    const response = await httpClient.post(`/powerfeed/${postId}/tip`, { amount });
    return response.data;
  },

  /**
   * Tip on a reel
   */
  async tipReel(reelId, amount) {
    const response = await httpClient.post(`/powerreel/${reelId}/tip`, { amount });
    return response.data;
  },

  /**
   * Tip on a stream
   */
  async tipStream(stationId, amount, message = "") {
    const response = await httpClient.post(`/stream/${stationId}/tip`, { amount, message });
    return response.data;
  },

  // ============================================================
  // PURCHASING
  // ============================================================

  /**
   * Get coin packages (pricing)
   */
  async getPackages() {
    const response = await httpClient.get("/coins/packages");
    return response.data;
  },

  /**
   * Get exchange rate info
   */
  async getExchangeRate() {
    const response = await httpClient.get("/coins/exchange-rate");
    return response.data;
  },

  /**
   * Purchase coins (initiate payment)
   */
  async purchaseCoins(packageId, paymentMethod) {
    const response = await httpClient.post("/coins/purchase", {
      packageId,
      paymentMethod,
    });
    return response.data;
  },

  /**
   * Confirm coin purchase (after payment processed)
   */
  async confirmPurchase(transactionId) {
    const response = await httpClient.post("/coins/purchase/confirm", { transactionId });
    return response.data;
  },

  /**
   * Create Stripe payment intent for coin purchase
   */
  async createPaymentIntent(packageId) {
    const response = await httpClient.post("/coins/payment-intent", { packageId });
    return response.data;
  },

  // ============================================================
  // WITHDRAWALS
  // ============================================================

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(amount, method, paymentDetails) {
    const response = await httpClient.post("/withdrawals", {
      amount,
      method,
      ...paymentDetails,
    });
    return response.data;
  },

  /**
   * Get withdrawal history
   */
  async getWithdrawals(options = {}) {
    const { limit = 20, skip = 0, status } = options;
    const params = new URLSearchParams({ limit, skip });
    if (status) params.append("status", status);
    
    const response = await httpClient.get(`/withdrawals?${params}`);
    return response.data;
  },

  /**
   * Get pending withdrawal total
   */
  async getPendingWithdrawalTotal() {
    const response = await httpClient.get("/withdrawals/pending-total");
    return response.data;
  },

  /**
   * Cancel a pending withdrawal
   */
  async cancelWithdrawal(withdrawalId) {
    const response = await httpClient.delete(`/withdrawals/${withdrawalId}`);
    return response.data;
  },

  // ============================================================
  // LEADERBOARDS
  // ============================================================

  /**
   * Get top tippers leaderboard
   */
  async getTopTippers(period = "week", limit = 10) {
    const response = await httpClient.get(`/coins/leaderboard/tippers?period=${period}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get top earners leaderboard
   */
  async getTopEarners(period = "week", limit = 10) {
    const response = await httpClient.get(`/coins/leaderboard/earners?period=${period}&limit=${limit}`);
    return response.data;
  },

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  /**
   * Subscribe to a creator
   */
  async subscribe(creatorId, tier = "basic") {
    const response = await httpClient.post("/subscriptions", { creatorId, tier });
    return response.data;
  },

  /**
   * Unsubscribe from a creator
   */
  async unsubscribe(subscriptionId) {
    const response = await httpClient.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  /**
   * Get user's subscriptions
   */
  async getSubscriptions() {
    const response = await httpClient.get("/subscriptions");
    return response.data;
  },

  /**
   * Get subscribers (for creators)
   */
  async getSubscribers(options = {}) {
    const { limit = 50, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/subscriptions/subscribers?${params}`);
    return response.data;
  },
};

export default coinsApi;



