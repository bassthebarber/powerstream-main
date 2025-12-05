// backend/scripts/ensureOwnerUser.js
// Seed script to ensure owner user (Bassbarberbeauty@gmail.com) exists
// When called from server.js, assumes mongoose connection is already open
// When called standalone, will connect and disconnect itself
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: ".env.local" });

const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const u = process.env.MONGO_USER;
  const p = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST || "cluster0.ldmtan.mongodb.net";
  const db = process.env.MONGO_DB || "powerstream";
  const appn = process.env.MONGO_APP || "Cluster0";
  const auth = (process.env.MONGO_AUTH_SOURCE || "").trim();

  if (!u || !p) return null;
  const encU = encodeURIComponent(u);
  const encP = encodeURIComponent(p);
  const base = `mongodb+srv://${encU}:${encP}@${host}/${db}?retryWrites=true&w=majority&appName=${encodeURIComponent(appn)}`;
  return auth ? `${base}&authSource=${encodeURIComponent(auth)}` : base;
};

export async function ensureOwnerUser() {
  try {
    // Guard: if we somehow got called too early, just log and return
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ ensureOwnerUser called while Mongo not connected; skipping.");
      return;
    }

    const ownerEmail = "Bassbarberbeauty@gmail.com".toLowerCase();
    const ownerPassword = "Chinamoma$59";

    // Check if owner user already exists (case-insensitive search)
    let user = await User.findOne({ email: ownerEmail });

    if (!user) {
      // Create owner user
      // Note: The User model's pre-save hook will hash the password automatically
      user = new User({
        email: ownerEmail,
        name: "Marcus",
        password: ownerPassword, // Will be hashed by pre-save hook
        role: "admin",
        isAdmin: true,
        isVerified: true,
        status: "active",
        label: "LABEL_ADMIN",
      });

      await user.save();
      console.log(`✅ Created owner user: ${ownerEmail}`);
      console.log(`   Password: ${ownerPassword}`);
    } else {
      // Update password to ensure it's always Chinamoma$59
      // Set plain password and mark as modified so pre-save hook will hash it
      user.password = ownerPassword;
      user.markModified("password");
      // Also ensure user is active and has correct role
      user.status = "active";
      user.role = "admin";
      user.isAdmin = true;
      user.isVerified = true;
      user.label = "LABEL_ADMIN";
      await user.save();
      console.log(`✅ Updated owner user password: ${ownerEmail}`);
    }

    console.log("✅ Owner user ensured:", ownerEmail);
  } catch (err) {
    console.error("⚠️ Error ensuring owner user (non-fatal):", err.message);
    // Do NOT rethrow; startup should continue
  }
}

// Standalone execution (for CLI use)
async function runStandalone() {
  try {
    const mongoUri = buildMongoUri();
    if (!mongoUri) {
      console.error("❌ Cannot build MongoDB URI. Check MONGO_URI or MONGO_USER/MONGO_PASS in .env.local");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB (standalone)");

    await ensureOwnerUser();

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB (standalone)");
  } catch (error) {
    console.error("❌ Fatal error in standalone mode:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStandalone();
}
