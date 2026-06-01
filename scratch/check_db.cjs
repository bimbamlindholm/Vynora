const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Native .env parser to avoid external dependencies
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, "../.env");
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, "utf-8");
    const env = {};
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        env[match[1]] = val.trim();
      }
    });
    return env;
  } catch (err) {
    console.error("Failed to parse .env file:", err);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Supabase credentials not found in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("🔍 Diagnosing Supabase Database Schema Status...\n");
  const results = [];

  // Helper to test custom column or query
  const testQuery = async (name, queryPromise) => {
    try {
      const { error } = await queryPromise;
      if (error && (error.message.includes("does not exist") || error.message.includes("not found"))) {
        results.push({ name, status: "❌ NOT RUN YET", detail: error.message });
      } else {
        results.push({ name, status: "✅ INSTALLED / RUN", detail: "Active and verified." });
      }
    } catch (err) {
      results.push({ name, status: "❌ ERROR", detail: err.message });
    }
  };

  // 1. Check consolidation columns (workspaces)
  await testQuery(
    "1. Consolidated Workspace Columns (geofence_enabled, overtime_rate, break_is_paid)",
    supabase.from("workspaces").select("geofence_enabled, overtime_rate, break_is_paid").limit(1)
  );

  // 2. Check consolidation columns (profiles rates)
  await testQuery(
    "2. Profile Base Rates (hourly_rate, daily_rate)",
    supabase.from("profiles").select("hourly_rate, daily_rate").limit(1)
  );

  // 3. Check subscription columns (profiles & workspaces subscription_tier)
  await testQuery(
    "3. Subscription Tier Columns (subscription_tier, subscription_status)",
    supabase.from("workspaces").select("subscription_tier, subscription_status").limit(1)
  );

  // 4. Check face verification column
  await testQuery(
    "4. AI Face Matching Column (profiles.face_photo)",
    supabase.from("profiles").select("face_photo").limit(1)
  );

  // 5. Check DTR geotagging (attendance_records latitude, longitude, overtime_approved)
  await testQuery(
    "5. DTR Geotagging & Overtime Columns (latitude, longitude, overtime_approved)",
    supabase.from("attendance_records").select("latitude, longitude, overtime_approved").limit(1)
  );

  // 6. Check Field Errands table
  await testQuery(
    "6. Field Errands Table (errands)",
    supabase.from("errands").select("*").limit(1)
  );

  // 7. Check Custom Holidays table
  await testQuery(
    "7. Custom Holidays Table (holidays)",
    supabase.from("holidays").select("*").limit(1)
  );

  // Print Summary Table
  console.log("=== DIAGNOSTIC REPORT ===");
  console.table(results);
}

checkDatabase();
