import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * sendMail — Core Email Utility
 * Uses Gmail SMTP with App Passwords.
 */
export async function sendMail({ to, subject, html }: SendMailOptions) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASS;

  if (!user || !pass) {
    console.warn("⚠️ Nodemailer not configured. Expected GMAIL_USER and GMAIL_APP_PASS in process.env.");
    console.warn(`Simulating email to: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"BOOK.ME" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`[Nodemailer] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Nodemailer] Failed to send email:", error);
    return false;
  }
}

/**
 * Pre-defined Email Templates
 */

export const EmailTemplates = {
  bookingReceived: (name: string, date: string, time: string, id: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #f59e0b;">Booking Received!</h2>
      <p>Hi ${name},</p>
      <p>We have successfully received your booking request. Our team will review it shortly.</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 0;"><strong>Booking ID:</strong> ${id}</p>
      </div>
      <p>Keep your Booking ID safe. You can use it on our website to check your status at any time.</p>
      <p>Best regards,<br/>The BOOK.ME Team</p>
    </div>
  `,

  bookingStatusChange: (name: string, status: string, id: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: ${status === "approved" || status === "confirmed" || status === "completed" ? "#10b981" : "#ef4444"};">Booking ${status.toUpperCase()}</h2>
      <p>Hi ${name},</p>
      <p>Your booking request (ID: <strong>${id}</strong>) has been <strong>${status}</strong>.</p>
      ${status === "approved" || status === "confirmed"  ? "<p>We look forward to seeing you! Let us know if you have any questions.</p>" : "<p>If you believe this was an error, please contact support.</p>"}
      <p>Best regards,<br/>The BOOK.ME Team</p>
    </div>
  `,

  eventReminder: (name: string, date: string, time: string, type: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #3b82f6;">Event Reminder!</h2>
      <p>Hi ${name},</p>
      <p>This is a friendly reminder that your <strong>${type}</strong> event is coming up in exactly 2 days!</p>
      <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bfdbfe;">
        <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${time}</p>
      </div>
      <p>We can't wait to make it unforgettable.</p>
      <p>Best regards,<br/>The BOOK.ME Team</p>
    </div>
  `,

  reviewRequest: (name: string, bookingId: string, eventType: string) => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const reviewLink = `${baseUrl}/reviews/new?bkgId=${bookingId}`;

    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; border-top: 4px solid #6366f1;">
        <h2 style="color: #6366f1;">Thank you for choosing BOOK.ME!</h2>
        <p>Hi ${name},</p>
        <p>We're so glad we could be a part of your <strong>${eventType}</strong>. Thank you for trusting us with your special event!</p>
        <p>We'd love to hear about your experience. Please take a moment to <strong>rate our service and give your feedback</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewLink}" style="background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Rate and Give Feedback
          </a>
        </div>

        <p>If the button doesn't work, copy and paste this link into your browser to rate us:</p>
        <p style="font-size: 12px; color: #6366f1; word-break: break-all;">${reviewLink}</p>

        <p>Best regards,<br/>The BOOK.ME Team</p>
      </div>
    `;
  },
  adminBookingReceived: (name: string, date: string, time: string, type: string, id: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6366f1;">New Booking Alert</h2>
      <p>Hello Admin,</p>
      <p>A new booking has been submitted via the platform:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Client:</strong> ${name}</p>
        <p style="margin: 0;"><strong>Event:</strong> ${type}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 0;"><strong>System ID:</strong> ${id}</p>
      </div>
      <p>Please log in to the admin dashboard to review and approve this request.</p>
    </div>
  `
};
