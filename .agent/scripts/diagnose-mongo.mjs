if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

/**
 * MongoDB Connection Diagnostic & Fix Script
 *
 * This script:
 * 1. Tests DNS SRV resolution using multiple DNS servers
 * 2. If SRV works, outputs the resolved hosts
 * 3. Builds the standard mongodb:// connection string (bypasses SRV)
 * 4. Tests the actual MongoDB connection
 *
 * Usage: node scripts/diagnose-mongo.mjs
 */

import { Resolver } from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "../.env.local");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

function log(type, msg) {
  const prefix = {
    pass: `  ${COLORS.green}PASS${COLORS.reset}`,
    fail: `  ${COLORS.red}FAIL${COLORS.reset}`,
    info: `  ${COLORS.cyan}INFO${COLORS.reset}`,
    warn: `  ${COLORS.yellow}WARN${COLORS.reset}`,
  };
  console.log(`${prefix[type] || "     "}  ${msg}`);
}

// ─── Step 1: Parse current connection string ────────────────
function parseEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    log("fail", `.env.local not found at ${ENV_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(ENV_PATH, "utf-8");
  const match = content.match(/MONGODB_URI=(.+)/);
  if (!match) {
    log("fail", "MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  return match[1].trim();
}

// ─── Step 2: Try SRV resolution with multiple DNS servers ───
async function resolveSRV(srvHostname) {
  const dnsServers = [
    { name: "System Default", servers: null },
    { name: "Google DNS", servers: ["8.8.8.8", "8.8.4.4"] },
    { name: "Cloudflare DNS", servers: ["1.1.1.1", "1.0.0.1"] },
  ];

  for (const { name, servers } of dnsServers) {
    try {
      const resolver = new Resolver();
      if (servers) resolver.setServers(servers);

      const records = await resolver.resolveSrv(srvHostname);
      log("pass", `SRV resolved via ${name}: ${records.length} hosts found`);
      records.forEach((r) =>
        log("info", `  -> ${r.name}:${r.port} (priority: ${r.priority})`)
      );
      return { records, dnsUsed: name };
    } catch (err) {
      log("fail", `SRV resolution via ${name}: ${err.code || err.message}`);
    }
  }

  return { records: null, dnsUsed: null };
}

// ─── Step 3: Resolve TXT records (for replicaSet & authSource) ──
async function resolveTXT(hostname, dnsServers) {
  try {
    const resolver = new Resolver();
    if (dnsServers) resolver.setServers(dnsServers);

    const txtRecords = await resolver.resolveTxt(hostname);
    const joined = txtRecords.map((r) => r.join("")).join("&");
    log("pass", `TXT record: ${joined}`);
    return joined;
  } catch (err) {
    log("warn", `TXT resolution failed: ${err.code || err.message}`);
    return "retryWrites=true&w=majority";
  }
}

// ─── Step 4: Build standard connection string ───────────────
function buildStandardURI(srvURI, srvRecords, txtParams) {
  // Parse: mongodb+srv://user:pass@host/db?params
  const match = srvURI.match(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/
  );
  if (!match) {
    log("fail", "Could not parse mongodb+srv:// URI");
    return null;
  }

  const [, user, pass, , dbName] = match;
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");

  // Use TXT params (already includes authSource & replicaSet), add ssl=true
  const standardURI = `mongodb://${user}:${pass}@${hosts}/${dbName}?ssl=true&${txtParams}`;

  return standardURI;
}

// ─── Step 5: Test connection with mongoose ──────────────────
async function testConnection(uri) {
  log("info", "Testing MongoDB connection...");

  try {
    // Dynamic import to avoid issues if mongoose isn't in path
    const mongoose = await import("mongoose");

    await mongoose.default.connect(uri, {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });

    log("pass", "MongoDB connection successful!");

    // Quick test: list collections
    const collections = await mongoose.default.connection.db
      .listCollections()
      .toArray();
    log(
      "info",
      `Database has ${collections.length} collections: ${collections.map((c) => c.name).join(", ") || "(empty)"}`
    );

    await mongoose.default.disconnect();
    return true;
  } catch (err) {
    log("fail", `MongoDB connection failed: ${err.message}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log(
    `\n${COLORS.bold}${COLORS.cyan}MongoDB Connection Diagnostic${COLORS.reset}`
  );
  console.log(`${COLORS.dim}Time: ${new Date().toISOString()}${COLORS.reset}\n`);

  // Step 1: Read URI
  const srvURI = parseEnv();
  const maskedURI = srvURI.replace(/:([^@]+)@/, ":****@");
  log("info", `Current URI: ${maskedURI}`);

  const isSRV = srvURI.startsWith("mongodb+srv://");
  log("info", `Connection type: ${isSRV ? "SRV (mongodb+srv://)" : "Standard (mongodb://)"}`);

  if (!isSRV) {
    // Already standard, just test it
    console.log(`\n${COLORS.bold}${COLORS.yellow}--- Testing Connection ---${COLORS.reset}`);
    const ok = await testConnection(srvURI);
    process.exit(ok ? 0 : 1);
  }

  // Step 2: Extract SRV hostname
  const hostMatch = srvURI.match(/@([^/]+)/);
  if (!hostMatch) {
    log("fail", "Cannot extract hostname from URI");
    process.exit(1);
  }

  const atlasHost = hostMatch[1];
  const srvHostname = `_mongodb._tcp.${atlasHost}`;
  log("info", `SRV hostname: ${srvHostname}`);

  // Step 3: Try SRV resolution
  console.log(`\n${COLORS.bold}${COLORS.yellow}--- DNS SRV Resolution ---${COLORS.reset}`);
  const { records, dnsUsed } = await resolveSRV(srvHostname);

  if (!records) {
    log(
      "fail",
      "ALL DNS servers failed SRV resolution. Your network may block SRV queries."
    );
    log("info", "Manual fix: Go to MongoDB Atlas → Connect → Choose 'Drivers'");
    log("info", "Select driver version 2.2.12 or later to get a standard mongodb:// URI");
    process.exit(1);
  }

  // Step 4: Resolve TXT
  console.log(`\n${COLORS.bold}${COLORS.yellow}--- TXT Record ---${COLORS.reset}`);
  const dnsForTXT =
    dnsUsed === "Google DNS"
      ? ["8.8.8.8", "8.8.4.4"]
      : dnsUsed === "Cloudflare DNS"
        ? ["1.1.1.1", "1.0.0.1"]
        : null;
  const txtParams = await resolveTXT(atlasHost, dnsForTXT);

  // Step 5: Build standard URI
  console.log(`\n${COLORS.bold}${COLORS.yellow}--- Building Standard URI ---${COLORS.reset}`);
  const standardURI = buildStandardURI(srvURI, records, txtParams);

  if (!standardURI) {
    process.exit(1);
  }

  const maskedStandard = standardURI.replace(/:([^@]+)@/, ":****@");
  log("pass", `Standard URI: ${maskedStandard}`);

  // Step 6: Test connection with standard URI
  console.log(`\n${COLORS.bold}${COLORS.yellow}--- Testing Standard Connection ---${COLORS.reset}`);
  const ok = await testConnection(standardURI);

  if (ok) {
    // Step 7: Update .env.local
    console.log(`\n${COLORS.bold}${COLORS.yellow}--- Updating .env.local ---${COLORS.reset}`);

    const envContent = fs.readFileSync(ENV_PATH, "utf-8");
    const updated = envContent.replace(
      /MONGODB_URI=.+/,
      `MONGODB_URI=${standardURI}`
    );
    fs.writeFileSync(ENV_PATH, updated, "utf-8");

    log("pass", ".env.local updated with standard connection string");
    log("info", "Restart your dev server to apply changes.");

    console.log(
      `\n${COLORS.green}${COLORS.bold}CONNECTION FIXED. Restart dev server now.${COLORS.reset}\n`
    );
  } else {
    log("fail", "Standard connection also failed. Check Atlas Network Access / credentials.");
    process.exit(1);
  }
}

main();
