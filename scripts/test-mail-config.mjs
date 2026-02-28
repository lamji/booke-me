import { sendMail, EmailTemplates } from "../lib/mail";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testMail() {
    console.log("🚀 Testing Email Configuration...");
    console.log(`Using GMAIL_USER: ${process.env.GMAIL_USER}`);

    try {
        const info = await sendMail({
            to: process.env.GMAIL_USER,
            subject: "BOOK.ME - System Test",
            html: EmailTemplates.bookingReceived("Test User", "2026-12-25", "10:00 AM", "TEST-ID-123"),
        });
        console.log("✅ Email sent successfully!");
        console.log(`Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
    }
}

testMail();
