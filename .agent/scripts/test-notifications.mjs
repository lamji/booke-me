/**
 * Verification script for Notification API endpoints.
 * Includes Admin Authentication Flow.
 */
import axios from "axios";

const BASE_URL = "http://localhost:3000";

async function simulateAdminLogin() {
    console.log("🔐 Authenticating as Admin...");
    const instance = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
    });

    // 1. Get CSRF Token
    const csrfRes = await instance.get("/api/auth/csrf");
    const csrfToken = csrfRes.data.csrfToken;
    const cookies = csrfRes.headers["set-cookie"];

    // 2. Perform Login
    const loginRes = await instance.post(
        "/api/auth/callback/credentials",
        new URLSearchParams({
            username: "admin",
            password: "admin123",
            csrfToken,
            json: "true",
        }).toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: cookies ? cookies.join("; ") : "",
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
        }
    );

    const sessionCookies = loginRes.headers["set-cookie"];
    return sessionCookies ? sessionCookies.join("; ") : "";
}

async function verifyNotifications() {
    console.log("🚀 Starting Notification API Verification...");

    try {
        const adminCookie = await simulateAdminLogin();
        const instance = axios.create({
            baseURL: BASE_URL,
            headers: { Cookie: adminCookie }
        });

        // 1. Create a notification (Using authenticated instance just in case)
        console.log("\n1. Creating notification...");
        const createRes = await instance.post(`/api/notifications`, {
            type: "new_booking",
            message: "Test notification: Verification script running with Auth.",
            link: "/admin",
        });
        
        if (createRes.status !== 201 && createRes.status !== 200) {
            console.error("❌ Notification creation failed. Status:", createRes.status);
            console.error("Response Data:", createRes.data);
            return;
        }

        const notificationId = createRes.data._id;
        console.log("✅ Created notification response status:", createRes.status);
        console.log("✅ Notification ID:", notificationId);

        if (!notificationId) {
            console.error("❌ No Notification ID returned! Response:", createRes.data);
            return;
        }

        // 2. List notifications
        console.log("\n2. Listing notifications (Authenticated)...");
        const listRes = await instance.get(`/api/notifications`);
        console.log("✅ List response type:", typeof listRes.data);
        if (Array.isArray(listRes.data)) {
            console.log(`✅ Total notifications found: ${listRes.data.length}`);
        } else {
            console.log("❌ List response is not an array:", listRes.data);
        }

        // 3. Mark as read
        console.log(`\n3. Marking notification ${notificationId} as read (Authenticated)...`);
        const patchRes = await instance.patch(`/api/notifications/${notificationId}`);
        if (patchRes.status === 200 && patchRes.data.isRead === true) {
            console.log("✅ Mark as read success!");
        } else {
            console.error("❌ Mark as read failed. Status:", patchRes.status, "Data:", patchRes.data);
        }

        // 4. Delete notification
        console.log(`\n4. Deleting notification ${notificationId} (Authenticated)...`);
        const delRes = await instance.delete(`/api/notifications/${notificationId}`);
        if (delRes.status === 200) {
            console.log("✅ Deletion success!");
        } else {
            console.error("❌ Deletion failed. Status:", delRes.status, "Data:", delRes.data);
        }

        console.log("\n🎉 Full E2E Notification Verification Finished!");
    } catch (error) {
        console.error("❌ Verification failed:", error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.error("⚠️  404 error detected. This usually means the dynamic route params were not awaited.");
        }
    }
}

verifyNotifications();
