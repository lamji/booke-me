if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ ERROR: This script is disabled in production environments.");
  process.exit(1);
}

/**
 * API Endpoint Test Suite
 *
 * HARD RULE: This script MUST be run before ANY deployment.
 * It tests every API endpoint in the application to catch
 * configuration errors, missing env vars, and broken routes.
 *
 * Usage:  node scripts/test-api.mjs
 * Requires: Server running at BASE_URL (default: http://localhost:3000)
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

const log = {
  pass: (msg) => console.log(`  ${COLORS.green}PASS${COLORS.reset}  ${msg}`),
  fail: (msg, detail) => {
    console.log(`  ${COLORS.red}FAIL${COLORS.reset}  ${msg}`);
    if (detail) console.log(`        ${COLORS.dim}${detail}${COLORS.reset}`);
  },
  info: (msg) => console.log(`  ${COLORS.cyan}INFO${COLORS.reset}  ${msg}`),
  header: (msg) =>
    console.log(`\n${COLORS.bold}${COLORS.yellow}--- ${msg} ---${COLORS.reset}`),
};

let passed = 0;
let failed = 0;

/**
 * Makes an HTTP request and validates the response.
 * @param {string} method - HTTP method
 * @param {string} path - API path (e.g., /api/bookings)
 * @param {object} options - { body, expectedStatus, description }
 */
async function testEndpoint(method, path, options = {}) {
  const {
    body = undefined,
    expectedStatus = 200,
    description = `${method} ${path}`,
  } = options;

  try {
    const fetchOptions = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) fetchOptions.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, fetchOptions);
    const data = await res.json().catch(() => null);

    if (res.status === expectedStatus) {
      log.pass(`${description} -> ${res.status}`);
      passed++;
      return { status: res.status, data, ok: true };
    } else {
      log.fail(
        `${description} -> Expected ${expectedStatus}, got ${res.status}`,
        data ? JSON.stringify(data).slice(0, 120) : "No response body"
      );
      failed++;
      return { status: res.status, data, ok: false };
    }
  } catch (err) {
    log.fail(`${description} -> Connection error`, err.message);
    failed++;
    return { status: 0, data: null, ok: false };
  }
}

// ─── Test Suites ─────────────────────────────────────────

async function testHealthChecks() {
  log.header("Health Checks");

  // Test that the app is running
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      log.pass(`Server is running at ${BASE_URL}`);
      passed++;
    } else {
      log.fail(`Server returned ${res.status}`, "Is the dev server running?");
      failed++;
    }
  } catch (err) {
    log.fail("Server is not reachable", err.message);
    failed++;
    console.log(
      `\n${COLORS.red}${COLORS.bold}CRITICAL: Cannot reach the server. Start it with 'npm run dev' first.${COLORS.reset}\n`
    );
    process.exit(1);
  }
}

async function testAuthEndpoints() {
  log.header("Auth Endpoints (NextAuth)");

  // NextAuth providers endpoint (should always work)
  await testEndpoint("GET", "/api/auth/providers", {
    description: "GET /api/auth/providers (NextAuth config check)",
  });

  // NextAuth session endpoint (should return empty session for unauthenticated)
  await testEndpoint("GET", "/api/auth/session", {
    description: "GET /api/auth/session (session check)",
  });

  // NextAuth CSRF token (required for sign-in flow)
  await testEndpoint("GET", "/api/auth/csrf", {
    description: "GET /api/auth/csrf (CSRF token)",
  });
}

async function testBookingAvailability() {
  log.header("Booking Availability API");

  // Missing fields should return 400
  await testEndpoint("POST", "/api/bookings/availability", {
    body: {},
    expectedStatus: 400,
    description: "POST /api/bookings/availability (missing fields -> 400)",
  });

  // Valid request
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await testEndpoint("POST", "/api/bookings/availability", {
    body: {
      eventDate: tomorrow.toISOString(),
      eventTime: "10:00 AM",
    },
    expectedStatus: 200,
    description: "POST /api/bookings/availability (valid payload -> 200)",
  });
}

async function testBookingsCRUD() {
  log.header("Bookings CRUD API");

  // GET all bookings
  const listResult = await testEndpoint("GET", "/api/bookings?page=1&limit=5", {
    description: "GET /api/bookings (list with pagination)",
  });

  // POST create booking - missing fields should return 400
  await testEndpoint("POST", "/api/bookings", {
    body: { eventType: "wedding" },
    expectedStatus: 400,
    description: "POST /api/bookings (missing fields -> 400)",
  });

  // POST create booking - valid
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);

  const createResult = await testEndpoint("POST", "/api/bookings", {
    body: {
      eventType: "wedding",
      eventDate: tomorrow.toISOString(),
      eventTime: "03:00 PM",
      clientName: "Test User",
      clientEmail: "test@bookme.test",
      clientPhone: "+63 999 000 0000",
      notes: "API test booking",
      addOns: ["Photography", "Catering"],
    },
    expectedStatus: 201,
    description: "POST /api/bookings (create valid booking -> 201)",
  });

  // PATCH update status - test with created booking
  if (createResult.ok && createResult.data?.booking?._id) {
    const bookingId = createResult.data.booking._id;
    log.info(`Created test booking: ${bookingId}`);

    await testEndpoint("PATCH", `/api/bookings/${bookingId}`, {
      body: { status: "approved" },
      expectedStatus: 200,
      description: `PATCH /api/bookings/${bookingId} (approve -> 200)`,
    });

    // Cancel it to clean up
    await testEndpoint("PATCH", `/api/bookings/${bookingId}`, {
      body: { status: "canceled" },
      expectedStatus: 200,
      description: `PATCH /api/bookings/${bookingId} (cancel -> 200)`,
    });
  }

  // PATCH with invalid status
  await testEndpoint("PATCH", "/api/bookings/000000000000000000000000", {
    body: { status: "invalid_status" },
    expectedStatus: 400,
    description: "PATCH /api/bookings/[id] (invalid status -> 400)",
  });

  // PATCH non-existent booking
  await testEndpoint("PATCH", "/api/bookings/000000000000000000000000", {
    body: { status: "approved" },
    expectedStatus: 404,
    description: "PATCH /api/bookings/[id] (not found -> 404)",
  });

  // Log count from GET if available
  if (listResult.ok && listResult.data?.pagination) {
    log.info(
      `Total bookings in DB: ${listResult.data.pagination.total} (Page ${listResult.data.pagination.page}/${listResult.data.pagination.totalPages})`
    );
  }
}

// ─── Runner ──────────────────────────────────────────────

async function main() {
  console.log(
    `\n${COLORS.bold}${COLORS.cyan}book.me API Test Suite${COLORS.reset}`
  );
  console.log(`${COLORS.dim}Target: ${BASE_URL}${COLORS.reset}`);
  console.log(`${COLORS.dim}Time:   ${new Date().toISOString()}${COLORS.reset}`);

  await testHealthChecks();
  await testAuthEndpoints();
  await testBookingAvailability();
  await testBookingsCRUD();

  // ─── Summary ─────────────────────────────────────────
  console.log(
    `\n${COLORS.bold}${COLORS.yellow}--- Summary ---${COLORS.reset}`
  );
  console.log(
    `  ${COLORS.green}Passed: ${passed}${COLORS.reset}  |  ${COLORS.red}Failed: ${failed}${COLORS.reset}  |  Total: ${passed + failed}`
  );

  if (failed > 0) {
    console.log(
      `\n${COLORS.red}${COLORS.bold}API TESTS FAILED. DO NOT DEPLOY.${COLORS.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `\n${COLORS.green}${COLORS.bold}ALL API TESTS PASSED. Safe to deploy.${COLORS.reset}\n`
    );
    process.exit(0);
  }
}

main();
