/**
 * BOOK.ME — E2E Admin Flow Tests (Jest)
 *
 * These tests SIMULATE ADMIN LOGIN first (per senior-dev-rules Section 3),
 * then hit the protected admin API endpoints with the session cookie.
 *
 * Auth Flow:
 *   1. GET /api/auth/csrf → extract csrfToken
 *   2. POST /api/auth/callback/credentials → extract session cookie
 *   3. Use cookie in all subsequent requests
 *
 * PREREQUISITE: Dev server must be running (`npm run dev`)
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export {};

// Store the session cookie & a booking ID for use across tests
let sessionCookie: string;
let testBookingId: string;

// ============================================================
// Helper: Admin Login Simulation
// ============================================================
async function simulateAdminLogin(): Promise<string> {
  const allCookies: Map<string, string> = new Map();

  // Helper to collect cookies from response
  function collectCookies(res: Response) {
    // Handling node-fetch behavior: headers.raw() is available and gives the array
    let setCookies: string[] = [];
    
    // Type-safe way to access non-standard header methods
    const headers = res.headers as unknown as { 
      raw?: () => Record<string, string[]>; 
      getSetCookie?: () => string[];
      get: (name: string) => string | null;
    };
    
    if (typeof headers.raw === 'function') {
      setCookies = headers.raw()['set-cookie'] || [];
    } else if (typeof headers.getSetCookie === 'function') {
      setCookies = headers.getSetCookie();
    } else {
      const raw = headers.get("set-cookie") || "";
      setCookies = raw.split(/,(?=[^ ])/);
    }
    
    for (const c of setCookies) {
      if (!c) continue;
      const nameVal = c.split(";")[0];
      const [name] = nameVal.split("=");
      allCookies.set(name.trim(), nameVal.trim());
    }
  }

  function getCookieString() {
    return Array.from(allCookies.values()).join("; ");
  }

  // Step 1: Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  collectCookies(csrfRes);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;

  // Step 2: POST credentials (don't follow redirect)
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: getCookieString(),
    },
    body: new URLSearchParams({
      username: "admin",
      password: "admin123",
      csrfToken,
      json: "true",
    }).toString(),
    redirect: "manual",
  });
  collectCookies(loginRes);

  // Step 3: Follow the redirect if there is one (NextAuth returns 302 to set session token)
  const redirectUrl = loginRes.headers.get("location");
  if (redirectUrl) {
    const fullUrl = redirectUrl.startsWith("http") ? redirectUrl : `${BASE_URL}${redirectUrl}`;
    const redirectRes = await fetch(fullUrl, {
      headers: { Cookie: getCookieString() },
      redirect: "manual",
    });
    collectCookies(redirectRes);
  }

  const finalCookies = getCookieString();

  if (!finalCookies.includes("next-auth.session-token")) {
    throw new Error(
      `Login simulation failed. Cookies: ${finalCookies || "none"}`
    );
  }

  return finalCookies;
}

// ============================================================
// Test Suite: Admin Flow
// ============================================================
describe("E2E: Admin Booking Management", () => {
  // ── Setup: Log in once, reuse session ──────────────────────
  beforeAll(async () => {
    sessionCookie = await simulateAdminLogin();
    console.log(`  🔐 Admin login simulated. Cookie captured.`);
  });

  // ============================================================
  // TC-A01: Login Simulation works
  // ============================================================
  test("TC-A01: Admin login simulation returns a valid session cookie", () => {
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain("next-auth.session-token");
    console.log(`  ✅ TC-A01: Session cookie is valid`);
  });

  // ============================================================
  // TC-A02: List all bookings (admin paginated)
  // ============================================================
  test("TC-A02: GET /api/bookings returns paginated bookings list", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?page=1&limit=5`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("bookings");
    expect(data).toHaveProperty("pagination");
    expect(data.pagination).toHaveProperty("page", 1);
    expect(data.pagination).toHaveProperty("limit", 5);
    expect(data.pagination).toHaveProperty("total");
    expect(data.pagination).toHaveProperty("totalPages");
    expect(Array.isArray(data.bookings)).toBe(true);

    // Capture a booking ID for later PATCH tests
    if (data.bookings.length > 0) {
      testBookingId = data.bookings[0]._id;
    }

    console.log(
      `  ✅ TC-A02: Listed ${data.bookings.length} bookings (Total: ${data.pagination.total})`
    );
  });

  // ============================================================
  // TC-A03: Filter bookings by status
  // ============================================================
  test("TC-A03: GET /api/bookings?status=pending returns only pending bookings", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?status=pending`, {
      headers: { Cookie: sessionCookie },
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.bookings)).toBe(true);

    // Every returned booking should be "pending"
    for (const b of data.bookings) {
      expect(b.status).toBe("pending");
    }

    console.log(`  ✅ TC-A03: Filtered ${data.bookings.length} pending bookings`);
  });

  // ============================================================
  // TC-A04: Approve a booking (PATCH)
  // ============================================================
  test("TC-A04: PATCH /api/bookings/[id] approves a booking", async () => {
    if (!testBookingId) {
      console.log(`  ⚠️ TC-A04: Skipped — no booking ID available from TC-A02`);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: "approved" }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("booking");
    expect(data.booking.status).toBe("approved");
    console.log(`  ✅ TC-A04: Booking ${testBookingId} APPROVED`);
  });

  // ============================================================
  // TC-A05: Cancel a booking (PATCH)
  // ============================================================
  test("TC-A05: PATCH /api/bookings/[id] cancels a booking", async () => {
    if (!testBookingId) {
      console.log(`  ⚠️ TC-A05: Skipped — no booking ID available from TC-A02`);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ status: "canceled" }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("booking");
    expect(data.booking.status).toBe("canceled");
    console.log(`  ✅ TC-A05: Booking ${testBookingId} CANCELED`);
  });

  // ============================================================
  // TC-A06: Unauthorized PATCH (no cookie)
  // ============================================================
  test("TC-A06: PATCH /api/bookings/[id] without auth returns non-200", async () => {
    if (!testBookingId) {
      console.log(`  ⚠️ TC-A06: Skipped — no booking ID`);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
      redirect: "manual",
    });

    // NextAuth middleware will redirect (302/307) or return 401
    expect(res.status).not.toBe(200);
    console.log(`  ✅ TC-A06: Unauthorized PATCH rejected with status ${res.status}`);
  });

  // ============================================================
  // TC-A07: Unauthorized GET bookings (no cookie)
  // ============================================================
  test("TC-A07: GET /api/bookings without auth returns non-200", async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, { redirect: "manual" });

    // NextAuth middleware redirects unauthenticated requests
    expect(res.status).not.toBe(200);
    console.log(`  ✅ TC-A07: Unauthorized GET rejected with status ${res.status}`);
  });

  // ============================================================
  // TC-A08: Logout Verification
  // ============================================================
  test("TC-A08: Admin Logout simulation functional check", async () => {
    // 1. Get a fresh CSRF token for signout
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();

    // 2. Hit the logout endpoint with CSRF and json:true
    const signoutRes = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: sessionCookie 
      },
      body: new URLSearchParams({ csrfToken, json: "true" }).toString(),
      redirect: "manual",
    });

    // 3. Verify the endpoint responds correctly (200 OK with redirect URL)
    expect(signoutRes.status).toBe(200);
    const body = await signoutRes.json();
    expect(body).toHaveProperty("url");
    expect(body.url).toContain("signout");
    
    console.log(`  ✅ TC-A08: Logout verified — signout endpoint functional.`);
  });
});
