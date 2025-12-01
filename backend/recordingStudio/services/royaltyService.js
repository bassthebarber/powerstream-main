// backend/recordingStudio/services/royaltyService.js
// Royalty Service - Auto-create royalty entries for beats, mixes, exports
// Integrates with Beat Store, Mix Engine, and Export workflow

import mongoose from 'mongoose';

// ==========================================
// ROYALTY SPLIT MODEL (embedded in service)
// ==========================================

const RoyaltySplitSchema = new mongoose.Schema({
  // Associated item
  itemType: { 
    type: String, 
    enum: ['beat', 'recording', 'mix', 'export'],
    required: true,
  },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemTitle: { type: String, required: true },
  
  // Main creator
  mainArtist: { type: String, required: true },
  mainArtistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Contributors with split percentages
  contributors: [{
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { 
      type: String, 
      enum: ['artist', 'producer', 'writer', 'label', 'publisher', 'other'],
      default: 'artist',
    },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    email: { type: String },
    paypalEmail: { type: String },
  }],
  
  // Financials
  totalEarnings: { type: Number, default: 0 },
  totalPlays: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  lastPayoutDate: { type: Date },
  lastPayoutAmount: { type: Number },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'disputed', 'closed'],
    default: 'draft',
  },
  
  // Notes
  notes: { type: String },
  
}, { timestamps: true });

RoyaltySplitSchema.index({ itemType: 1, itemId: 1 });
RoyaltySplitSchema.index({ 'contributors.userId': 1 });
RoyaltySplitSchema.index({ status: 1 });

// Check if model exists before creating
const RoyaltySplit = mongoose.models.RoyaltySplit || mongoose.model('RoyaltySplit', RoyaltySplitSchema);

// ==========================================
// SERVICE FUNCTIONS
// ==========================================

/**
 * Create an empty royalty entry for a newly saved beat
 * @param {Object} beat - Beat document
 * @returns {Object} Created royalty split
 */
export async function createRoyaltyEntryForBeat(beat) {
  try {
    // Default split: 100% to producer
    const defaultContributors = [
      {
        name: beat.producerName || 'Studio AI',
        role: 'producer',
        percentage: 100,
      },
    ];

    const royaltySplit = new RoyaltySplit({
      itemType: 'beat',
      itemId: beat._id,
      itemTitle: beat.title,
      mainArtist: beat.producerName || 'Studio AI',
      mainArtistId: beat.ownerUserId || beat.producerId,
      contributors: defaultContributors,
      status: 'draft',
      notes: `Auto-created for beat: ${beat.title}`,
    });

    await royaltySplit.save();
    
    console.log(`💰 [RoyaltyService] Created royalty entry for beat: ${beat.title}`);
    
    return royaltySplit;
  } catch (err) {
    console.error('❌ [RoyaltyService] Error creating royalty for beat:', err.message);
    throw err;
  }
}

/**
 * Create royalty entry for a mix/master
 * @param {Object} mixdown - Mixdown document
 * @param {Object} options - Additional options
 * @returns {Object} Created royalty split
 */
export async function createRoyaltyEntryForMix(mixdown, options = {}) {
  try {
    const contributors = [
      {
        name: mixdown.artistName || 'Unknown Artist',
        role: 'artist',
        percentage: 70,
      },
      {
        name: 'Studio AI',
        role: 'producer',
        percentage: 30,
      },
    ];

    // Override with provided contributors
    if (options.contributors && options.contributors.length > 0) {
      contributors.length = 0;
      contributors.push(...options.contributors);
    }

    const royaltySplit = new RoyaltySplit({
      itemType: 'mix',
      itemId: mixdown._id,
      itemTitle: mixdown.trackTitle,
      mainArtist: mixdown.artistName || 'Unknown Artist',
      mainArtistId: mixdown.ownerUserId,
      contributors,
      status: 'draft',
      notes: `Auto-created for mix: ${mixdown.trackTitle}`,
    });

    await royaltySplit.save();
    
    console.log(`💰 [RoyaltyService] Created royalty entry for mix: ${mixdown.trackTitle}`);
    
    return royaltySplit;
  } catch (err) {
    console.error('❌ [RoyaltyService] Error creating royalty for mix:', err.message);
    throw err;
  }
}

/**
 * Create royalty entry for an export
 * @param {Object} exportItem - Export/library item document
 * @param {Object} options - Additional options
 * @returns {Object} Created royalty split
 */
export async function createRoyaltyEntryForExport(exportItem, options = {}) {
  try {
    const contributors = options.contributors || [
      {
        name: exportItem.artistName || 'Unknown Artist',
        role: 'artist',
        percentage: 100,
      },
    ];

    const royaltySplit = new RoyaltySplit({
      itemType: 'export',
      itemId: exportItem._id,
      itemTitle: exportItem.title,
      mainArtist: exportItem.artistName || 'Unknown Artist',
      mainArtistId: exportItem.ownerUserId,
      contributors,
      status: 'draft',
      notes: `Auto-created for export: ${exportItem.title}`,
    });

    await royaltySplit.save();
    
    console.log(`💰 [RoyaltyService] Created royalty entry for export: ${exportItem.title}`);
    
    return royaltySplit;
  } catch (err) {
    console.error('❌ [RoyaltyService] Error creating royalty for export:', err.message);
    throw err;
  }
}

/**
 * Get royalty split by item
 * @param {string} itemType - Type of item
 * @param {string} itemId - Item ID
 * @returns {Object} Royalty split
 */
export async function getRoyaltySplitByItem(itemType, itemId) {
  try {
    return await RoyaltySplit.findOne({ itemType, itemId });
  } catch (err) {
    console.error('❌ [RoyaltyService] Error getting royalty split:', err.message);
    return null;
  }
}

/**
 * Update royalty split contributors
 * @param {string} splitId - Royalty split ID
 * @param {Array} contributors - New contributors array
 * @returns {Object} Updated royalty split
 */
export async function updateRoyaltySplitContributors(splitId, contributors) {
  try {
    // Validate total = 100%
    const total = contributors.reduce((sum, c) => sum + (c.percentage || 0), 0);
    if (total !== 100) {
      throw new Error('Contributor percentages must total 100%');
    }

    const split = await RoyaltySplit.findByIdAndUpdate(
      splitId,
      { 
        $set: { 
          contributors,
          status: 'active',
        } 
      },
      { new: true }
    );

    console.log(`💰 [RoyaltyService] Updated royalty split: ${split?.itemTitle}`);
    
    return split;
  } catch (err) {
    console.error('❌ [RoyaltyService] Error updating royalty split:', err.message);
    throw err;
  }
}

/**
 * Log earnings for a royalty split
 * @param {string} splitId - Royalty split ID
 * @param {number} amount - Earnings amount
 * @param {number} plays - Number of plays
 */
export async function logRoyaltyEarnings(splitId, amount, plays = 1) {
  try {
    const split = await RoyaltySplit.findByIdAndUpdate(
      splitId,
      { 
        $inc: { 
          totalEarnings: amount,
          totalPlays: plays,
          pendingPayout: amount,
        } 
      },
      { new: true }
    );

    console.log(`💵 [RoyaltyService] Logged earnings $${amount} for: ${split?.itemTitle}`);
    
    return split;
  } catch (err) {
    console.error('❌ [RoyaltyService] Error logging earnings:', err.message);
    throw err;
  }
}

/**
 * Get all royalty splits for a user
 * @param {string} userId - User ID
 * @returns {Array} Royalty splits
 */
export async function getRoyaltySplitsForUser(userId) {
  try {
    return await RoyaltySplit.find({
      $or: [
        { mainArtistId: userId },
        { 'contributors.userId': userId },
      ],
    }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('❌ [RoyaltyService] Error getting user royalties:', err.message);
    return [];
  }
}

/**
 * Get all royalty splits (for admin)
 * @param {Object} filters - Query filters
 * @returns {Array} Royalty splits
 */
export async function getAllRoyaltySplits(filters = {}) {
  try {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.itemType) query.itemType = filters.itemType;

    return await RoyaltySplit.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);
  } catch (err) {
    console.error('❌ [RoyaltyService] Error getting all royalties:', err.message);
    return [];
  }
}

export { RoyaltySplit };

export default {
  createRoyaltyEntryForBeat,
  createRoyaltyEntryForMix,
  createRoyaltyEntryForExport,
  getRoyaltySplitByItem,
  updateRoyaltySplitContributors,
  logRoyaltyEarnings,
  getRoyaltySplitsForUser,
  getAllRoyaltySplits,
  RoyaltySplit,
};



