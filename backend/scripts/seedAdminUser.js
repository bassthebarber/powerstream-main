// backend/scripts/seedAdminUser.js
// Seed script to ensure admin@powerstream.com user exists
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

export async function seedAdminUser() {
  try {
    // Guard: if we somehow got called too early, just log and return
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ seedAdminUser called while Mongo not connected; skipping.");
      return;
    }

    const adminEmail = "admin@powerstream.com";
    const adminPassword = "PowerStream123!";

    // Check if admin user already exists
    let user = await User.findOne({ email: adminEmail });

    if (!user) {
      // Create admin user
      // Note: The User model's pre-save hook will hash the password automatically
      user = new User({
        email: adminEmail,
        name: "Marcus",
        password: adminPassword, // Will be hashed by pre-save hook
        role: "admin",
        isAdmin: true,
        isVerified: true,
        status: "active",
        label: "LABEL_ADMIN",
      });

      await user.save();
      console.log(`✅ Created admin user: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log(`✅ Admin user ${adminEmail} already exists`);
    }

    console.log("✅ Admin user seeded");
  } catch (err) {
    console.error("⚠️ Error seeding admin user (non-fatal):", err.message);
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

    await seedAdminUser();

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
