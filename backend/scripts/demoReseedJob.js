import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reseedDemoData() {
  console.log("⏳ Running nightly reseed...");
  const { error } = await supabase.rpc("reseed_demo_data");
  if (error) {
    console.error("❌ Reseed failed:", error.message);
  } else {
    console.log("✅ Demo reseed complete at", new Date().toISOString());
  }
}

cron.schedule("0 0 * * *", reseedDemoData); // midnight
reseedDemoData(); // run once on start
