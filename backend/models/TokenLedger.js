// backend/models/TokenLedger.js
// Blockchain-style immutable ledger for coin transactions per Overlord Spec
import mongoose from "mongoose";
import crypto from "crypto";

const tokenLedgerSchema = new mongoose.Schema(
  {
    // Block hash (SHA-256 of payload + prevHash + timestamp)
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Previous block hash (creates the chain)
    prevHash: {
      type: String,
      required: true,
      index: true,
    },
    
    // Block number / sequence
    blockNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    
    // Transaction payload
    payload: {
      // Transaction type
      type: {
        type: String,
        enum: [
          "genesis",
          "mint",
          "burn",
          "transfer",
          "tip",
          "purchase",
          "earn",
          "spend",
          "admin_adjust",
          "refund",
        ],
        required: true,
      },
      
      // Sender (null for mint/genesis)
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      
      // Recipient
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      
      // Amount of tokens
      amount: {
        type: Number,
        required: true,
      },
      
      // Reference to related entity
      reference: {
        entityType: String, // 'post', 'stream', 'subscription', etc.
        entityId: mongoose.Schema.Types.ObjectId,
      },
      
      // Additional metadata
      memo: String,
      
      // Fee (if any)
      fee: {
        type: Number,
        default: 0,
      },
    },
    
    // Balances after this transaction
    balances: {
      from: Number,
      to: Number,
    },
    
    // Verification status
    verified: {
      type: Boolean,
      default: true,
    },
    
    // Timestamp (separate from createdAt for block time)
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { 
    timestamps: true,
    collection: "token_ledger",
  }
);

// Index for efficient queries
tokenLedgerSchema.index({ "payload.from": 1, timestamp: -1 });
tokenLedgerSchema.index({ "payload.to": 1, timestamp: -1 });
tokenLedgerSchema.index({ "payload.type": 1, timestamp: -1 });

// Calculate hash for a block
tokenLedgerSchema.statics.calculateHash = function(prevHash, payload, timestamp) {
  const data = JSON.stringify({ prevHash, payload, timestamp: timestamp.toISOString() });
  return crypto.createHash("sha256").update(data).digest("hex");
};

// Get the latest block
tokenLedgerSchema.statics.getLatestBlock = async function() {
  return this.findOne().sort({ blockNumber: -1 });
};

// Create genesis block (first block in the chain)
tokenLedgerSchema.statics.createGenesisBlock = async function() {
  const existing = await this.findOne({ blockNumber: 0 });
  if (existing) {
    return existing;
  }
  
  const timestamp = new Date();
  const prevHash = "0".repeat(64); // Genesis block has no previous hash
  const payload = {
    type: "genesis",
    amount: 0,
    memo: "PowerStream Token Ledger Genesis Block",
  };
  
  const hash = this.calculateHash(prevHash, payload, timestamp);
  
  const genesis = new this({
    hash,
    prevHash,
    blockNumber: 0,
    payload,
    timestamp,
    balances: { from: null, to: null },
  });
  
  await genesis.save();
  return genesis;
};

// Add a new transaction to the ledger
tokenLedgerSchema.statics.addTransaction = async function(transactionData) {
  const latestBlock = await this.getLatestBlock();
  
  if (!latestBlock) {
    // Create genesis block first
    await this.createGenesisBlock();
    return this.addTransaction(transactionData);
  }
  
  const timestamp = new Date();
  const prevHash = latestBlock.hash;
  const blockNumber = latestBlock.blockNumber + 1;
  
  const hash = this.calculateHash(prevHash, transactionData.payload, timestamp);
  
  const newBlock = new this({
    hash,
    prevHash,
    blockNumber,
    payload: transactionData.payload,
    balances: transactionData.balances,
    timestamp,
  });
  
  await newBlock.save();
  return newBlock;
};

// Verify chain integrity
tokenLedgerSchema.statics.verifyChain = async function() {
  const blocks = await this.find().sort({ blockNumber: 1 });
  
  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];
    
    // Check if previous hash matches
    if (currentBlock.prevHash !== previousBlock.hash) {
      return {
        valid: false,
        error: `Chain broken at block ${currentBlock.blockNumber}`,
        blockNumber: currentBlock.blockNumber,
      };
    }
    
    // Verify hash
    const calculatedHash = this.calculateHash(
      currentBlock.prevHash,
      currentBlock.payload,
      currentBlock.timestamp
    );
    
    if (currentBlock.hash !== calculatedHash) {
      return {
        valid: false,
        error: `Hash mismatch at block ${currentBlock.blockNumber}`,
        blockNumber: currentBlock.blockNumber,
      };
    }
  }
  
  return { valid: true, blockCount: blocks.length };
};

// Get transaction history for a user
tokenLedgerSchema.statics.getHistoryForUser = async function(userId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({
    $or: [
      { "payload.from": userId },
      { "payload.to": userId },
    ],
  })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate("payload.from", "name username")
    .populate("payload.to", "name username");
};

const TokenLedger = mongoose.models.TokenLedger || mongoose.model("TokenLedger", tokenLedgerSchema);

export default TokenLedger;


