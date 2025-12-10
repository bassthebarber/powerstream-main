// backend/src/domain/repositories/user.repository.js
// User data access layer
import User from "../../../models/User.js";
import { toObjectId, isValidObjectId } from "../../utils/ids.js";
import { cacheUserProfile, getCachedUserProfile, invalidateUserCache } from "../../config/redis.js";

/**
 * User repository - handles all user data access
 */
const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id, options = {}) {
    if (!isValidObjectId(id)) return null;
    
    // Check cache first
    if (!options.skipCache) {
      const cached = await getCachedUserProfile(id);
      if (cached) return cached;
    }
    
    const user = await User.findById(id)
      .select(options.select || "-password")
      .lean();
    
    // Cache the result
    if (user) {
      await cacheUserProfile(id, user);
    }
    
    return user;
  },
  
  /**
   * Find user by email
   */
  async findByEmail(email, options = {}) {
    return User.findOne({ email: email.toLowerCase() })
      .select(options.includePassword ? undefined : "-password")
      .lean();
  },
  
  /**
   * Create a new user
   */
  async create(userData) {
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
    });
    await user.save();
    return user.toJSON();
  },
  
  /**
   * Update user by ID
   */
  async updateById(id, updates) {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password").lean();
    
    // Invalidate cache
    if (user) {
      await invalidateUserCache(id);
    }
    
    return user;
  },
  
  /**
   * Update user password
   */
  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) return null;
    
    user.password = newPassword;
    await user.save(); // Triggers pre-save hook for hashing
    
    return true;
  },
  
  /**
   * Find users by IDs
   */
  async findByIds(ids, options = {}) {
    const validIds = ids.filter(isValidObjectId).map(toObjectId);
    
    return User.find({ _id: { $in: validIds } })
      .select(options.select || "name avatarUrl")
      .lean();
  },
  
  /**
   * Search users by name or email
   */
  async search(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    
    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      status: "active",
    };
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name avatarUrl")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    
    return { users, total };
  },
  
  /**
   * Check if email exists
   */
  async emailExists(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  },
  
  /**
   * Update user coin balance
   */
  async updateCoinBalance(id, amount) {
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { coinBalance: amount } },
      { new: true }
    ).select("coinBalance").lean();
    
    if (user) {
      await invalidateUserCache(id);
    }
    
    return user?.coinBalance;
  },
  
  /**
   * Verify user email
   */
  async verifyEmail(id) {
    return this.updateById(id, { isVerified: true });
  },
  
  /**
   * Suspend or ban user
   */
  async setStatus(id, status) {
    return this.updateById(id, { status });
  },
  
  /**
   * Get users by role
   */
  async findByRole(role, options = {}) {
    const { limit = 50, skip = 0 } = options;
    
    return User.find({
      $or: [
        { role },
        { roles: role },
      ],
    })
      .select("name email role roles")
      .skip(skip)
      .limit(limit)
      .lean();
  },
  
  /**
   * Count users by status
   */
  async countByStatus() {
    const pipeline = [
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ];
    
    const results = await User.aggregate(pipeline);
    
    return results.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, { active: 0, suspended: 0, banned: 0 });
  },
};

export default userRepository;




