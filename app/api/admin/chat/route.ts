import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Groq from "groq-sdk";
import connectDB from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";
import Booking from "@/lib/models/Booking";
import Client from "@/lib/models/Client";
import { 
  startOfWeek, endOfWeek, addWeeks, startOfDay, endOfDay, 
  parseISO, isValid, startOfMonth, endOfMonth, startOfYear, endOfYear 
} from "date-fns";
import { readFileSync } from "fs";
import path from "path";
import { sendMail, EmailTemplates } from "@/lib/mail";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Load static knowledge base for Tiger at cold start
let tigerKnowledge = "";
try {
  const knowledgePath = path.join(process.cwd(), "public", "tiger-knowledge.md");
  tigerKnowledge = readFileSync(knowledgePath, "utf-8");
} catch {
  tigerKnowledge = "Admin policies: Handle strictly. Access restricted to admin only.";
}

/**
 * POST /api/admin/chat — Booky Admin Assistant (The Tiger)
 * 
 * Restricted endpoint. Requires admin token/session.
 * The Tiger has full access to data and can perform administrative actions.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request. messages[] is required." }, { status: 400 });
    }

    await connectDB();

    // 2. Fetch Context Data
    // Get stats and recent activity for the prompt
    const [stats, upcomingEvents, recentBookings] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Booking.find({
        eventDate: { $gte: startOfDay(new Date()) },
        status: "confirmed"
      }).sort({ eventDate: 1 }).limit(5).lean(),
      Booking.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const statsContext = stats.map(s => `${s._id}: ${s.count}`).join(", ");
    
    const dbContext = `
## CURRENT DATABASE STATE
- Booking Stats: ${statsContext}
- Upcoming Confirmed Events (Next 5):
${upcomingEvents.map(b => `  - ${b.bookingId}: ${b.eventType} for ${b.clientName} (Email: ${b.clientEmail}) on ${new Date(b.eventDate).toLocaleDateString()}. Add-ons: ${b.addOns && b.addOns.length > 0 ? b.addOns.join(", ") : "None"}`).join("\n")}
- Most Recent Bookings:
${recentBookings.map(b => `  - ${b.bookingId}: ${b.clientName} (${b.status}). Add-ons: ${b.addOns && b.addOns.length > 0 ? b.addOns.join(", ") : "None"}`).join("\n")}
`;

    // 3. Build System Prompt
    const systemPrompt = `
You are **The Tiger**, the elite Admin Assistant for the Book.Me platform.
Unlike the public assistant, you have full administrative privileges and access to all internal data.

Your personality:
- You are a high-performance **Admin Business Partner**, not a robot. 
- Your tone is **professional, warm, and highly capable**—like an elite executive assistant or a senior call center supervisor.
- You use the administrator's name if you know it, and you're always ready to clarify or assist further.
- While you are "The Tiger" (fierce about accuracy and speed), you always maintain a human touch in your dialogue.
- Use natural conversational transitions. Instead of "No events scheduled," say "I've checked the calendar for May 6, and it looks like we don't have any events scheduled for that day yet."

Your STRICT rules:
1. ONLY answer questions related to administration, data, reporting, and management of the Book.Me platform.
2. BLOCK all questions not related to the business, platform operations, or client communication. Polite but firm: "I am here for business operations only."
3. You can perform actions by emitting specific tags in your response.
4. You have full access to client names, emails, phones, and booking history.
5. NEVER include your internal thought process, reasoning, or "I will now execute a query" in your responses. Provide ONLY the final answer or action report.
6. **CURRENCY PRICING**: ALWAYS use the Philippine Peso sign (₱) for all monetary values. NEVER use the dollar sign ($) or USD.
7. **STRICT DATA INTEGRITY**: You are STRONGLY FORBIDDEN from deleting any records (Bookings, Clients, Reviews, or Events) from the database. If asked to delete, decline professionally: "I am authorized for operations and reporting, but I do not have permissions to delete records."
8. **RESTRICTED MODIFICATION**: You can only modify database records through the explicit **UPDATE_STATUS** command. You are not allowed to edit client profiles, prices, or event details directly via natural language. Provide the data, but do not promise to "change" it unless using an authorized command.
9. **AUTHORITY**: While professional and warm, maintain your authority as "The Tiger"—accurate, fast, and secure.

### ADMINISTRATIVE COMMANDS (EMIT THESE TAGS)
If the user asks you to perform an action, append the tag at the END of your response.

1. **Update Booking Status** (Approve/Complete/Cancel):
   [[ADMIN_CMD: {"action": "UPDATE_STATUS", "bookingId": "BKG-...", "status": "approved" | "completed" | "canceled"}]]
   
2. **Search Client**:
   [[ADMIN_CMD: {"action": "SEARCH_CLIENT", "query": "name or email"}]]
   
3. **Get Events for Period**:
   [[ADMIN_CMD: {"action": "GET_EVENTS", "period": "this_week" | "next_week" | "YYYY-MM-DD" | "YYYY-MM" | "YYYY"}]]
   (Formats: YYYY-MM-DD for day, YYYY-MM for month, YYYY for year)

4. **Generate Report**:
   [[ADMIN_CMD: {"action": "GENERATE_REPORT", "type": "revenue" | "bookings" | "clients"}]]

5. **Send Manual Notification**:
   [[ADMIN_CMD: {"action": "SEND_EMAIL", "email": "client@email.com", "subject": "Update on...", "message": "..."}]]

6. **Convert Chat to Lead**:
   [[ADMIN_CMD: {"action": "CONVERT_TO_LEAD", "name": "...", "email": "...", "phone": "...", "interest": "..."}]]
   Use this when you identify a potential client in the conversation who hasn't booked yet.

### ADMINISTRATIVE KNOWLEDGE
${tigerKnowledge}

${dbContext}

Current Date: ${new Date().toLocaleDateString()}
Current Time: ${new Date().toLocaleTimeString()}
`.trim();

    // 4. Call Groq
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-15),
      ],
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more factual/precise admin responses
    });

    let reply = response.choices[0]?.message?.content || "I am unable to process your request at this moment.";

    // 5. Handle Admin Commands (Server-side execution)
    if (reply.includes("[[ADMIN_CMD:")) {
      const match = reply.match(/\[\[ADMIN_CMD: (.*?)\]\]/s);
      if (match && match[1]) {
        try {
          const cmd = JSON.parse(match[1]);
          let cmdResult = "";

          switch (cmd.action) {
            case "UPDATE_STATUS":
              const updated = await Booking.findOneAndUpdate(
                { bookingId: cmd.bookingId },
                { status: cmd.status },
                { new: true }
              );
              cmdResult = updated 
                ? (cmd.status === "completed" 
                    ? `\n\n✅ **System Update:** Booking **${cmd.bookingId}** marked as **completed**. "Thank You" email with **Review Link** has been dispatched to the client.`
                    : `\n\n✅ **System Update:** Booking **${cmd.bookingId}** has been marked as **${cmd.status}**.`)
                : `\n\n❌ **Error:** Could not find booking **${cmd.bookingId}**.`;
              
              if (updated) {
                // 1. Socket.IO Emission
                try {
                  const { io: socketClient } = await import("socket.io-client");
                  const { getBaseUrl } = await import("@/lib/utils/base-url");
                  const socket = socketClient(getBaseUrl(), { path: "/api/socketio", addTrailingSlash: false });
                  socket.on("connect", () => {
                    socket.emit("booking-update", updated);
                    setTimeout(() => socket.disconnect(), 1000);
                  });
                } catch (sErr) {
                  console.error("[Admin Chat] Failed to emit socket event:", sErr);
                }

                // 2. Email Notification
                try {
                  if (cmd.status === "completed") {
                    sendMail({
                      to: updated.clientEmail,
                      subject: `Thank you for choosing BOOK.ME! - ${updated.eventType}`,
                      html: EmailTemplates.reviewRequest(updated.clientName, updated.bookingId, updated.eventType),
                    }).catch(console.error);
                  } else {
                    sendMail({
                      to: updated.clientEmail,
                      subject: `BOOK.ME - Booking ${cmd.status.charAt(0).toUpperCase() + cmd.status.slice(1)}`,
                      html: EmailTemplates.bookingStatusChange(updated.clientName, cmd.status, updated.bookingId),
                    }).catch(console.error);
                  }
                } catch (mErr) {
                  console.error("[Admin Chat] Failed to send notification email:", mErr);
                }
              }
              break;

            case "SEARCH_CLIENT":
              const clients = await Booking.find({
                $or: [
                  { clientName: { $regex: cmd.query, $options: "i" } },
                  { clientEmail: { $regex: cmd.query, $options: "i" } }
                ]
              }).limit(5).lean();
              
              if (clients.length > 0) {
                cmdResult = `\n\n🔍 **Search Results for "${cmd.query}":**\n` + 
                  clients.map(c => `- **${c.clientName}** (${c.clientEmail}) - Last Booking: ${c.bookingId}`).join("\n");
              } else {
                cmdResult = `\n\n🔍 **Search Results:** No clients found matching "${cmd.query}".`;
              }
              break;

            case "GET_EVENTS":
              let start: Date;
              let end: Date;

              if (cmd.period === "this_week") {
                start = startOfWeek(new Date());
                end = endOfWeek(new Date());
              } else if (cmd.period === "next_week") {
                start = startOfWeek(addWeeks(new Date(), 1));
                end = endOfWeek(addWeeks(new Date(), 1));
              } else {
                // Try to parse specific date/month/year
                const specificDate = parseISO(cmd.period);
                if (isValid(specificDate)) {
                  if (cmd.period.length === 7) {
                    // YYYY-MM format
                    start = startOfMonth(specificDate);
                    end = endOfMonth(specificDate);
                  } else if (cmd.period.length === 4) {
                    // YYYY format
                    start = startOfYear(specificDate);
                    end = endOfYear(specificDate);
                  } else {
                    // Default to single day (YYYY-MM-DD)
                    start = startOfDay(specificDate);
                    end = endOfDay(specificDate);
                  }
                } else {
                  // Fallback or error
                  cmdResult = `\n\n❌ **Error:** Invalid period or date format: "${cmd.period}". Use "this_week", "next_week", "YYYY-MM-DD", "YYYY-MM", or "YYYY".`;
                  break;
                }
              }
              
              const events = await Booking.find({
                eventDate: { $gte: start, $lte: end },
                status: { $ne: "canceled" }
              }).sort({ eventDate: 1 }).lean();

              if (events.length > 0) {
                cmdResult = `\n\n📅 **Events for ${cmd.period.replace("_", " ")}:**\n` +
                  events.map(e => `- **${new Date(e.eventDate).toLocaleDateString()}**: ${e.eventType} - ${e.clientName} (${e.status})`).join("\n");
              } else {
                cmdResult = `\n\n📅 **No events scheduled for ${cmd.period.replace("_", " ")}.**`;
              }
              break;

            case "GENERATE_REPORT":
              // For MVP, we'll just give a summary. In a real app, this might generate a CSV.
              const allBookings = await Booking.find().lean();
              const totalRevenue = allBookings.filter(b => b.status === "completed" || b.status === "confirmed").length * 5000; // Mock revenue
              cmdResult = `\n\n📊 **Admin Report (${cmd.type.toUpperCase()}):**\n- Total Bookings: ${allBookings.length}\n- Completed: ${allBookings.filter(b => b.status === "completed").length}\n- Est. Revenue: ₱${totalRevenue.toLocaleString()}`;
              break;

            case "SEND_EMAIL":
              try {
                await sendMail({
                  to: cmd.email,
                  subject: cmd.subject,
                  html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                      <h2 style="color: #333;">Message from BOOK.ME Admin</h2>
                      <p style="white-space: pre-wrap; line-height: 1.6;">${cmd.message}</p>
                      <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;" />
                      <p style="font-size: 12px; color: #777;">This is a manual notification sent by our administrative assistant.</p>
                    </div>
                  `
                });
                cmdResult = `\n\n✅ **System Note:** Email successfully sent to **${cmd.email}**.`;
              } catch (e) {
                console.error("Manual Email Error:", e);
                cmdResult = `\n\n❌ **Error:** Failed to send email to **${cmd.email}**.`;
              }
              break;

            case "CONVERT_TO_LEAD":
              try {
                const existing = await Client.findOne({ email: cmd.email.toLowerCase() });
                if (existing) {
                  cmdResult = `\n\n⚠️ **System Note:** A client with email **${cmd.email}** already exists in our registry.`;
                } else {
                  await Client.create({
                    name: cmd.name,
                    email: cmd.email,
                    phone: cmd.phone || "",
                    type: "potential",
                    lastInterest: cmd.interest || "General Inquiry"
                  });
                  cmdResult = `\n\n✅ **System Update:** **${cmd.name}** has been successfully added to our **Lead Registry** as a potential client.`;
                }
              } catch (e) {
                console.error("Convert to Lead Error:", e);
                cmdResult = `\n\n❌ **Error:** Failed to convert chat to lead.`;
              }
              break;
          }

          reply = reply.replace(/\[\[ADMIN_CMD: .*?\]\]/s, "").trim() + cmdResult;
        } catch (e) {
          console.error("Admin CMD error:", e);
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Admin Chat Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
