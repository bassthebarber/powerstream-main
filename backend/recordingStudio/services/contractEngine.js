// backend/recordingStudio/services/contractEngine.js
// Contract Engine - Generates contracts and manages studio job fees
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import StudioJob, { JOB_TYPES, JOB_STATUS, DEFAULT_PRICING } from "../models/StudioJob.js";
import StudioContract, { CONTRACT_STATUS, CONTRACT_TYPES } from "../models/StudioContract.js";
import LiveRoomSession from "../models/LiveRoomSession.js";

/**
 * Platform configuration for fees
 */
const PLATFORM_CONFIG = {
  defaultPlatformFeePercent: 15, // 15% platform fee
  minPlatformFeePercent: 10,
  maxPlatformFeePercent: 30,
  platformName: "PowerStream / Southern Power Syndicate",
  governingLaw: "State of Texas, USA",
};

/**
 * ContractEngine - Manages studio jobs, contracts, and fee calculations
 */
const contractEngine = {
  /**
   * Create a new studio job
   * @param {Object} params - Job parameters
   * @returns {Promise<Object>} Created job
   */
  async createStudioJob({
    sessionId,
    studioSessionId,
    artistId,
    engineerId,
    type,
    title,
    description,
    basePrice,
    platformFeePercent,
    engineerSharePercent,
    currency = "USD",
    includesRoyalties = false,
    royaltyPercent = 0,
    inputFiles = [],
    dueDate,
    maxRevisions = 2,
  }) {
    // Validate job type
    if (!Object.values(JOB_TYPES).includes(type)) {
      throw new Error(`Invalid job type: ${type}. Valid types: ${Object.values(JOB_TYPES).join(", ")}`);
    }

    // Default to platform pricing if no base price provided
    if (!basePrice) {
      basePrice = DEFAULT_PRICING[type] || 10000;
    }

    // Default fee percentages
    if (!platformFeePercent) {
      platformFeePercent = PLATFORM_CONFIG.defaultPlatformFeePercent;
    }
    if (!engineerSharePercent) {
      engineerSharePercent = 100 - platformFeePercent;
    }

    // Create the job
    const job = new StudioJob({
      sessionId,
      studioSessionId,
      artistId,
      engineerId,
      type,
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")} Job`,
      description,
      status: engineerId ? JOB_STATUS.IN_PROGRESS : JOB_STATUS.OPEN,
      basePrice,
      platformFeePercent,
      engineerSharePercent,
      currency,
      includesRoyalties,
      royaltyPercent,
      inputFiles,
      dueDate,
      maxRevisions,
      startedAt: engineerId ? new Date() : null,
    });

    await job.save();

    // If there's a live room session, link the job
    if (sessionId) {
      const session = await LiveRoomSession.findById(sessionId);
      if (session) {
        session.jobId = job._id;
        await session.save();
      }
    }

    return job;
  },

  /**
   * Generate a contract for a studio job
   * @param {string} jobId - The job ID
   * @param {Object} options - Contract options
   * @returns {Promise<Object>} Generated contract
   */
  async generateStudioContract(jobId, options = {}) {
    // Load the job with populated users
    const job = await StudioJob.findById(jobId)
      .populate("artistId", "name email avatarUrl")
      .populate("engineerId", "name email avatarUrl");

    if (!job) {
      throw new Error("Job not found");
    }

    // Determine contract type based on job settings
    let contractType = CONTRACT_TYPES.WORK_FOR_HIRE;
    if (job.includesRoyalties && job.royaltyPercent > 0) {
      contractType = CONTRACT_TYPES.ROYALTY_SPLIT;
    }
    if (options.contractType) {
      contractType = options.contractType;
    }

    // Calculate pricing
    const totalPrice = job.basePrice;
    const platformFeeAmount = Math.round(totalPrice * job.platformFeePercent / 100);
    const engineerAmount = totalPrice - platformFeeAmount;

    // Build royalty splits if applicable
    const royaltySplits = [];
    if (job.includesRoyalties) {
      // Default split: Artist keeps majority, engineer gets agreed percent
      royaltySplits.push(
        { party: "artist", percent: 100 - job.royaltyPercent },
        { party: "engineer", percent: job.royaltyPercent }
      );
    }

    // Create the contract
    const contract = new StudioContract({
      jobId: job._id,
      artistId: job.artistId._id || job.artistId,
      engineerId: job.engineerId?._id || job.engineerId,
      type: contractType,
      status: CONTRACT_STATUS.DRAFT,
      
      title: options.title || `Studio Services Agreement - ${job.title}`,
      
      structuredTerms: {
        serviceDescription: options.serviceDescription || 
          `Professional ${job.type.replace(/_/g, " ")} services for the project "${job.title}".`,
        deliverables: options.deliverables || [
          "High-quality audio files in WAV format (48kHz/24-bit)",
          "MP3 preview files",
          "Stems/session files if applicable",
        ],
        deadlines: {
          startDate: job.startedAt || new Date(),
          deliveryDate: job.dueDate,
          expirationDate: options.expirationDate,
        },
        revisionPolicy: {
          maxRevisions: job.maxRevisions,
          revisionFee: options.revisionFee || 0,
        },
        cancellationPolicy: {
          artistCanCancel: true,
          engineerCanCancel: true,
          cancellationFee: options.cancellationFee || 0,
          refundPercent: options.refundPercent || 100,
        },
        disputeResolution: "Platform mediation through PowerStream support, followed by binding arbitration if necessary.",
      },

      pricing: {
        totalPrice,
        platformFeePercent: job.platformFeePercent,
        platformFeeAmount,
        engineerPercent: job.engineerSharePercent,
        engineerAmount,
        includesRoyalties: job.includesRoyalties,
        royaltyPercent: job.royaltyPercent,
        royaltySplits,
      },

      governingLaw: PLATFORM_CONFIG.governingLaw,
    });

    // Generate the full contract text
    contract.terms = contract.generateContractText(job.artistId, job.engineerId);
    contract.termsSummary = this.generateContractSummary(contract, job);

    await contract.save();

    // Link contract to job
    job.contractId = contract._id;
    await job.save();

    return contract;
  },

  /**
   * Generate a human-readable summary of the contract
   */
  generateContractSummary(contract, job) {
    const pricing = contract.pricing;
    return `
This ${contract.type.replace(/_/g, " ")} agreement covers ${job.type.replace(/_/g, " ")} services 
for a total of $${(pricing.totalPrice / 100).toFixed(2)}. 
The platform takes a ${pricing.platformFeePercent}% fee ($${(pricing.platformFeeAmount / 100).toFixed(2)}), 
and the engineer receives $${(pricing.engineerAmount / 100).toFixed(2)} (${pricing.engineerPercent}%).
${pricing.includesRoyalties 
  ? `Additionally, the engineer will receive ${pricing.royaltyPercent}% of future royalties.` 
  : "No royalty sharing is included in this agreement."}
    `.trim();
  },

  /**
   * Activate a contract (both parties have signed)
   * @param {string} contractId - Contract ID
   * @returns {Promise<Object>} Updated contract
   */
  async activateContract(contractId) {
    const contract = await StudioContract.findById(contractId).populate("jobId");
    
    if (!contract) {
      throw new Error("Contract not found");
    }

    if (!contract.isFullySigned()) {
      throw new Error("Contract must be signed by all parties before activation");
    }

    contract.status = CONTRACT_STATUS.ACTIVE;
    contract.activatedAt = new Date();
    await contract.save();

    // Update the job status
    if (contract.jobId) {
      const job = await StudioJob.findById(contract.jobId._id || contract.jobId);
      if (job && job.status === JOB_STATUS.OPEN) {
        job.status = JOB_STATUS.IN_PROGRESS;
        job.startedAt = new Date();
        await job.save();
      }
    }

    return contract;
  },

  /**
   * Complete a job and trigger payment processing
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Result with job and payment info
   */
  async completeJob(jobId) {
    const job = await StudioJob.findById(jobId)
      .populate("artistId", "name email coinBalance")
      .populate("engineerId", "name email coinBalance");

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== JOB_STATUS.APPROVED) {
      throw new Error("Job must be approved before completion");
    }

    // Mark job as paid
    job.status = JOB_STATUS.PAID;
    job.paidAt = new Date();
    job.paymentStatus = "completed";

    // TODO: Integrate with coins/payment system
    // For now, we'll create mock transactions
    const transactions = await this.processJobPayment(job);

    await job.save();

    // Complete the contract if exists
    if (job.contractId) {
      const contract = await StudioContract.findById(job.contractId);
      if (contract) {
        await contract.complete();
      }
    }

    return {
      job,
      transactions,
      summary: {
        totalCharged: job.basePrice,
        platformFee: job.platformFeeAmount,
        engineerPayout: job.engineerAmount,
        currency: job.currency,
      },
    };
  },

  /**
   * Process payment for a completed job
   * TODO: Integrate with PowerStream coins/payment system
   * @param {Object} job - The job object
   * @returns {Promise<Array>} Created transactions
   */
  async processJobPayment(job) {
    // TODO: Replace with actual coin/payment integration
    // This is a placeholder that simulates the payment flow

    const transactions = [];

    // Transaction 1: Platform fee collection
    transactions.push({
      type: "platform_fee",
      amount: job.platformFeeAmount,
      from: job.artistId._id,
      to: "platform",
      description: `Platform fee for ${job.type} job: ${job.title}`,
      jobId: job._id,
      status: "completed",
      createdAt: new Date(),
    });

    // Transaction 2: Engineer payment
    if (job.engineerId) {
      transactions.push({
        type: "engineer_payment",
        amount: job.engineerAmount,
        from: "platform",
        to: job.engineerId._id,
        description: `Payment for ${job.type} job: ${job.title}`,
        jobId: job._id,
        status: "completed",
        createdAt: new Date(),
      });
    }

    // TODO: Actually create CoinTransaction records
    // const CoinTransaction = (await import("../../src/domain/models/CoinTransaction.model.js")).default;
    // for (const tx of transactions) {
    //   await CoinTransaction.create(tx);
    // }

    // TODO: Update user coin balances
    // if (job.artistId?.coinBalance !== undefined) {
    //   job.artistId.coinBalance -= job.basePrice;
    //   await job.artistId.save();
    // }
    // if (job.engineerId?.coinBalance !== undefined) {
    //   job.engineerId.coinBalance += job.engineerAmount;
    //   await job.engineerId.save();
    // }

    console.log("[ContractEngine] Payment processed (MOCK):", {
      jobId: job._id,
      total: job.basePrice,
      platformFee: job.platformFeeAmount,
      engineerPayout: job.engineerAmount,
    });

    return transactions;
  },

  /**
   * Get pricing breakdown for a job type
   * @param {string} jobType - Type of job
   * @param {number} customPrice - Optional custom price override
   * @param {number} platformFeePercent - Optional custom fee percent
   * @returns {Object} Pricing breakdown
   */
  getPricingBreakdown(jobType, customPrice = null, platformFeePercent = null) {
    const basePrice = customPrice || DEFAULT_PRICING[jobType] || 10000;
    const feePercent = platformFeePercent || PLATFORM_CONFIG.defaultPlatformFeePercent;
    const platformFeeAmount = Math.round(basePrice * feePercent / 100);
    const engineerAmount = basePrice - platformFeeAmount;

    return {
      jobType,
      basePrice,
      basePriceFormatted: `$${(basePrice / 100).toFixed(2)}`,
      platformFeePercent: feePercent,
      platformFeeAmount,
      platformFeeFormatted: `$${(platformFeeAmount / 100).toFixed(2)}`,
      engineerSharePercent: 100 - feePercent,
      engineerAmount,
      engineerAmountFormatted: `$${(engineerAmount / 100).toFixed(2)}`,
    };
  },

  /**
   * Get default prices for all job types
   * @returns {Object} All default prices
   */
  getDefaultPrices() {
    const prices = {};
    for (const [type, cents] of Object.entries(DEFAULT_PRICING)) {
      prices[type] = {
        cents,
        formatted: `$${(cents / 100).toFixed(2)}`,
        ...this.getPricingBreakdown(type),
      };
    }
    return prices;
  },

  /**
   * Sign a contract as a specific party
   * @param {string} contractId - Contract ID
   * @param {string} party - 'artist' or 'engineer'
   * @param {Object} signatureInfo - Signature data, IP, user agent
   * @returns {Promise<Object>} Updated contract
   */
  async signContract(contractId, party, signatureInfo = {}) {
    const contract = await StudioContract.findById(contractId);
    
    if (!contract) {
      throw new Error("Contract not found");
    }

    if (contract.status === CONTRACT_STATUS.COMPLETED || 
        contract.status === CONTRACT_STATUS.CANCELLED) {
      throw new Error(`Cannot sign a ${contract.status} contract`);
    }

    await contract.sign(
      party,
      signatureInfo.signatureData || `ELECTRONIC_SIGNATURE_${party.toUpperCase()}`,
      signatureInfo.ipAddress || "",
      signatureInfo.userAgent || ""
    );

    // If both parties have signed, activate the contract
    if (contract.isFullySigned()) {
      await this.activateContract(contractId);
    }

    return contract;
  },

  /**
   * Cancel a job
   * @param {string} jobId - Job ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancelled job
   */
  async cancelJob(jobId, reason = "") {
    const job = await StudioJob.findById(jobId);
    
    if (!job) {
      throw new Error("Job not found");
    }

    await job.cancel(reason);

    // Cancel associated contract if exists
    if (job.contractId) {
      const contract = await StudioContract.findById(job.contractId);
      if (contract) {
        await contract.cancel(reason);
      }
    }

    return job;
  },

  /**
   * Get job statistics for admin dashboard
   * @returns {Promise<Object>} Statistics
   */
  async getJobStatistics() {
    const stats = await StudioJob.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$basePrice" },
          platformFees: { $sum: "$platformFeeAmount" },
          engineerPayouts: { $sum: "$engineerAmount" },
        },
      },
    ]);

    const byType = await StudioJob.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalValue: { $sum: "$basePrice" },
        },
      },
    ]);

    return {
      byStatus: stats,
      byType,
      totals: {
        jobs: await StudioJob.countDocuments(),
        contracts: await StudioContract.countDocuments(),
        activeSessions: await LiveRoomSession.countDocuments({ 
          status: { $in: ["pending", "live", "paused"] } 
        }),
      },
    };
  },
};

export default contractEngine;
export { PLATFORM_CONFIG, contractEngine };




