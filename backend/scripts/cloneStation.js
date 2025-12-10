// backend/scripts/cloneStation.js
// Global Broadcast Mode - Station Cloning for International Expansion
// Usage: node scripts/cloneStation.js <baseSlug> <newSlug> <newName>
// Example: node scripts/cloneStation.js southern-power-network ng-southern-power "Nigeria Southern Power"

import mongoose from "mongoose";
import dotenv from "dotenv";
import Station from "../models/Station.js";

dotenv.config();

/**
 * Clone a station for a new region/country
 * @param {string} baseSlug - The slug of the station to clone
 * @param {string} newSlug - The slug for the new station
 * @param {string} newName - The name for the new station
 * @returns {Promise<object>} The cloned station
 */
export async function cloneStation(baseSlug, newSlug, newName) {
  const base = await Station.findOne({ slug: baseSlug });
  if (!base) throw new Error(`Base station not found: ${baseSlug}`);

  // Check if target already exists
  const existing = await Station.findOne({ slug: newSlug });
  if (existing) throw new Error(`Station already exists: ${newSlug}`);

  // Extract region from slug (e.g., "ng-" for Nigeria, "uk-" for UK)
  const slugParts = newSlug.split("-");
  const region = slugParts[0].toUpperCase();

  const clone = new Station({
    name: newName,
    slug: newSlug,
    logo: base.logo,
    logoUrl: base.logoUrl,
    bannerUrl: base.bannerUrl,
    description: base.description,
    network: base.network,
    theme: base.theme,
    schedule: [],
    videos: [],
    region: region,
    country: region,
    isPublic: true,
    isActive: true,
  });

  await clone.save();
  console.log(`✅ Cloned station: ${baseSlug} → ${newSlug} (${newName})`);
  return clone;
}

// CLI execution
if (process.argv[1].includes("cloneStation")) {
  const [, , baseSlug, newSlug, newName] = process.argv;

  if (!baseSlug || !newSlug || !newName) {
    console.log("Usage: node scripts/cloneStation.js <baseSlug> <newSlug> <newName>");
    console.log('Example: node scripts/cloneStation.js southern-power-network ng-southern-power "Nigeria Southern Power"');
    process.exit(1);
  }

  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("🔌 Connected to MongoDB");

      const cloned = await cloneStation(baseSlug, newSlug, newName);
      console.log("📺 New station created:", cloned.toJSON());
    } catch (err) {
      console.error("❌ Clone failed:", err.message);
    } finally {
      await mongoose.disconnect();
      process.exit();
    }
  })();
}

export default cloneStation;



