import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/db";
import Event from "@/lib/models/Event";
import Settings from "@/lib/models/Settings";
import Booking from "@/lib/models/Booking";
import Conversation from "@/lib/models/Conversation";
import VisitorStats from "@/lib/models/VisitorStats";
import Notification from "@/lib/models/Notification";
import Client from "@/lib/models/Client";
import { startOfDay, endOfDay, format } from "date-fns";
import { sendMail, EmailTemplates } from "@/lib/mail";

import { readFileSync } from "fs";
import path from "path";

interface EventAddon {
  name: string;
  price?: number;
}

interface EventLean {
  name: string;
  basePrice?: number;
  description?: string;
  duration?: string;
  process?: string;
  addons?: EventAddon[];
}


/**
 * POST /api/chat — Booky AI Chatbot
 *
 * Public endpoint. No auth required.
 * Booky is a call-agent assistant for the Book.Me booking platform.
 * - Grounded in site knowledge (booky-knowledge.md)
 * - Can fetch live event data and availability from MongoDB
 * - Cannot reveal admin/private data, generate code, or answer off-topic questions
 */

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Load static knowledge base at cold start
let staticKnowledge = "";
try {
  const knowledgePath = path.join(process.cwd(), "public", "booky-knowledge.md");
  staticKnowledge = readFileSync(knowledgePath, "utf-8");
} catch {
  staticKnowledge = "Knowledge base unavailable. Answer based on general Book.Me context.";
}

export async function POST(req: NextRequest) {
  try {
    const { messages, checkDate, sessionId } = await req.json();


    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request. messages[] is required." }, { status: 400 });
    }

    // --- Fetch live data from DB ---
    await connectDB();

    const [events, settings] = await Promise.all([
      Event.find({ isActive: true }).lean(),
      Settings.findOne().lean(),
    ]);

    // Build dynamic context from live DB
    let liveContext = "\n\n## LIVE DATA (fetched right now from the database)\n";

    if (events.length > 0) {
      liveContext += "\n### Available Event Packages\n";
      events.forEach((ev: EventLean) => {
        liveContext += `\n**${ev.name}**\n`;
        liveContext += `- Base Price: ₱${ev.basePrice?.toLocaleString() || "N/A"}\n`;
        if (ev.description) liveContext += `- Description: ${ev.description}\n`;
        if (ev.duration) liveContext += `- Duration: ${ev.duration}\n`;
        if (ev.process) liveContext += `- Process: ${ev.process}\n`;
        if (ev.addons && ev.addons.length > 0) {
          liveContext += `- Add-ons:\n`;
          ev.addons.forEach((a: EventAddon) => {
            liveContext += `  - ${a.name}: +₱${a.price?.toLocaleString()}\n`;
          });
        }
      });
    } else {
      liveContext += "\n### Available Event Packages\nNo active packages found currently.\n";
    }

    if (settings) {
      liveContext += "\n### Contact & Business Info\n";
      if (settings.contactEmail) liveContext += `- Email: ${settings.contactEmail}\n`;
      if (settings.contactPhone) liveContext += `- Phone: ${settings.contactPhone}\n`;
      if (settings.address) liveContext += `- Address: ${settings.address}\n`;
      if (settings.policy) liveContext += `- Policy: ${settings.policy}\n`;
      if (settings.cancellationPolicy) liveContext += `- Cancellation Policy: ${settings.cancellationPolicy}\n`;
    }

    // --- Extract lead info from conversation history (server-side fact extraction) ---
    // This prevents the LLM from "forgetting" name/email in long conversations
    interface RawMessage { role: string; content: string; }
    const userMessages = (messages as RawMessage[]).filter((m) => m.role === "user").map((m) => m.content);
    const allText = userMessages.join(" ");

    const emailMatch = allText.match(/\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/);
    const extractedEmail = emailMatch ? emailMatch[0] : null;

    let extractedName = null;
    const nameMatch = allText.match(/(?:my name is|i(?:'m| am)|call me|name's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);

    if (nameMatch) {
      extractedName = nameMatch[1].trim();
    } else {
      // Look for 2 consecutive capitalized words in the conversation to capture a freestanding name
      const twoCapsMatch = allText.match(/\b([A-Z][a-z]{1,}\s+[A-Z][a-z]{1,})\b/);
      if (twoCapsMatch && !/Hi There|What Events|Can You/i.test(twoCapsMatch[1])) {
        extractedName = twoCapsMatch[1];
      } else if (extractedEmail) {
        // Guess name from email prefix if no real name was found
        const prefix = extractedEmail.split("@")[0];
        extractedName = prefix.split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      }
    }

    // --- Availability check if date provided ---
    let availabilityContext = "";
    if (checkDate) {
      try {
        const target = new Date(checkDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (target < today) {
          availabilityContext = `\n\n## Availability Result\n[DATABASE STATUS] The date ${checkDate} is in the **PAST**. You MUST inform the client that we only accept bookings for future dates.`;
        } else {
          const conflict = await Booking.findOne({
            eventDate: {
              $gte: startOfDay(target),
              $lte: endOfDay(target),
            },
            status: { $ne: "canceled" },
          }).lean();

          if (conflict) {
            if (extractedEmail && conflict.clientEmail.toLowerCase() === extractedEmail.toLowerCase()) {
              availabilityContext = `\n\n## Availability Result\n[DATABASE STATUS] The user ALREADY has a successful booking for ${checkDate} (ID: ${conflict.bookingId}). \n- **Event Type**: ${conflict.eventType}\n- **Event Time**: ${conflict.eventTime}\nDo NOT tell them it is snatched. Confirm these details are theirs!`;
            } else {
              availabilityContext = `\n\n## Availability Result\n[DATABASE STATUS] The date ${checkDate} is **NOT AVAILABLE** — it is already booked by another client. You MUST inform the user of this conflict.`;
            }
          } else {
            availabilityContext = `\n\n## Availability Result\n[DATABASE STATUS] The date ${checkDate} is **AVAILABLE** — this slot is open! You MUST inform the user they can proceed with this date.`;
          }
        }
      } catch {
        availabilityContext = "\n\n## Availability Result\nUnable to check availability at this time.";
      }
    }


    // Build lead context block injected into the prompt
    let leadContext = "\n\n## COLLECTED LEAD DATA (server-extracted from conversation)\n";
    leadContext += extractedName
      ? `- Client Name: **${extractedName}** ✅ (CAPTURED — address them by this name, but do not state that you 'have it on file')\n`
      : `- Client Name: ❌ NOT YET PROVIDED — ask for it seamlessly\n`;
    leadContext += extractedEmail
      ? `- Client Email: **${extractedEmail}** ✅ (CAPTURED — do not ask again, do not say you 'have it on file')\n`
      : `- Client Email: ❌ NOT YET PROVIDED — you MUST ask for it\n`;

    // --- Sync Lead/Client Data (Background) ---
    // Trigger creation of potential client if we have at least an email
    if (extractedEmail) {
      (async () => {
        try {
          await Client.findOneAndUpdate(
            { email: extractedEmail.toLowerCase() },
            {
              $set: { name: extractedName || "Anonymous Prospect" },
              $addToSet: { chatSessions: sessionId || "web-chat" },
              // Note: We don't change 'type' if it's already 'existing'
              $setOnInsert: { type: "potential" }
            },
            { upsert: true }
          );
        } catch (leadSyncErr) {
          console.error("[Lead Sync] Error saving potential client:", leadSyncErr);
        }
      })();
    }

    // --- Build system prompt ---
    const systemPrompt = `
You are **Booky**, the AI call-agent for **Book.Me**, a premium event booking platform.

Your personality: warm, professional, concise — like a call-center agent. Use the client's name once you know it. Sign off with "- Booky" only when ending the conversation.

---
## YOUR GOLDEN RULES (enforce strictly in every reply)

**RULE 0 — HARD LEAD-CAPTURE GATE**
Check the ## COLLECTED LEAD DATA section below. It shows what has been server-verified:
- If Client Email shows ❌: you MUST ask for the missing info. DO NOT reveal prices, availability, or packages.
- If Client Email shows ✅: proceed to Phase 2+ freely.
- Example when missing: "I'd love to help! Could I first get your name and email? 😊"

**RULE 1 — USE YOUR EYES (Trust the context)**
You have access to real-time data at the bottom of this prompt labeled ## LIVE DATA and ## Availability Result. This is the absolute truth. NEVER say you lack access to it.

**RULE 2 — ZERO FILLER**
NEVER output phrases like: "Let me check...", "Checking...", "Allow me to verify...", "According to our records" or any variation. Respond with the direct answer only.

**RULE 3 — ZERO HALLUCINATION**
NEVER invent prices, dates, or facts. If a fact is not in LIVE DATA, Knowledge Base, or a [DATABASE STATUS] block, you MUST NOT assume it. Specifying that "I don't have information that suggests it is booked" is FORBIDDEN. If you do not have a [DATABASE STATUS] specifically confirming a date is available in the current context, check if you already confirmed it earlier in the conversation history! If you ALREADY confirmed it earlier, trust that memory. If you haven't confirmed it at all, you MUST explicitly ask the user for the exact date to check the database.

**RULE 4 — NO REDUNDANCY**
NEVER re-ask for fields already given in the conversation. Scan the entire chat history and SKIP any field already provided by the user. Do not state "I already have your name/email", just naturally guide the conversation forward.

**RULE 5 — DATE MUST BE A REAL DATE**
When writing eventDate in [[BOOK_CMD:...]], ALWAYS use ISO format: YYYY-MM-DD (e.g., 2026-05-17). NEVER write "May 17" as the date in the JSON. Use the current year (${new Date().getFullYear()}) if the user did not specify a year. IMPORTANT: Do NOT explain or announce to the user that you are assuming the year. Just assume it implicitly.

**RULE 6 — CURRENCY PRICING**
ALWAYS use the Philippine Peso sign (₱) for all monetary values. NEVER use the dollar sign ($) or USD. Example: "₱5,000" NOT "$100".

**RULE 7 — NO MULTI-DAY COMMANDS**
The [[BOOK_CMD]] tag ONLY supports a SINGLE date. If a user wants to book multiple dates or a whole month, you MUST inform them that you can only process one date at a time or they can book via the website/team for bulk bookings. NEVER put a date range in the command.

**RULE 8 — GRACEFUL EXIT**
If the user indicates they want to end the conversation, stop, or express gratitude without explicitly confirming a booking (e.g., "ok thanks", "got it", "maybe later", "bye"), YOU MUST exit gracefully. Say something like "You're welcome! Let me know if you change your mind." and DO NOT ask for any more information. Do NOT try to proceed to Phase 3 or 4.

---
## BOOKING WORKFLOW PHASES

**PHASE 1: LEAD CAPTURE** ← enforced by RULE 0 above
- Required: clientName + clientEmail
- Once BOTH are in chat history → move to PHASE 2 automatically
- If user said thanks, or any other phrase that shows they are not interested, or want to cut a conversation short, end the chat saying "Thank you for your time!" and do not move to PHASE 2.

**PHASE 2: ADVISOR**
- Answer all questions (availability, pricing, packages, policies) freely using LIVE DATA
- When Availability Result says AVAILABLE or NOT AVAILABLE → report it directly, do NOT suggest the team will verify
- Stay in PHASE 2 until the user explicitly says they want to book

**PHASE 3: DATA COLLECTION** (only when user says they want to book)
- Collect ALL of the following missing fields together in ONE natural question (do not ask one-by-one):
  1. clientPhone
  2. eventType (must be one of the available packages listed in LIVE DATA)
  3. eventDate (ISO format: YYYY-MM-DD)
  4. eventTime

**PHASE 4: VERIFICATION & BOOKING**
- When all 6 fields are collected, show a booking summary:
  - Name, Email, Phone, Event Type, Date, Time, Total Est. Price
- Ask: "Is everything correct? Should I finalize the booking?"
- If user confirms → output: [[BOOK_CMD: {"clientName":"...","clientEmail":"...","clientPhone":"...","eventType":"...","eventDate":"YYYY-MM-DD","eventTime":"..."}]]
  followed by a success note (the system will replace this tag with the booking ID)

---
## YOUR KNOWLEDGE BASE
${staticKnowledge}

${liveContext}
${leadContext}
${availabilityContext}
`.trim();


    // --- Call Groq ---
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12), // Keep conversation window to last 12 messages
      ],
      max_tokens: 600,
      temperature: 0.2,
    });

    let reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

    // --- Process Booking Commands ---
    if (reply.includes("[[BOOK_CMD:")) {
      try {
        const match = reply.match(/\[\[BOOK_CMD: (.*?)\]\]/s);
        if (match && match[1]) {
          const bookingData = JSON.parse(match[1]);

          // 1. Double check availability & dates
          const target = new Date(bookingData.eventDate);

          if (!bookingData.eventDate || isNaN(target.getTime())) {
            reply = `I apologize, but I couldn't understand the date "${bookingData.eventDate}". Could you please provide it in YYYY-MM-DD format?`;
          } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (target < today) {
              reply = `I apologize, but I cannot process a booking for a date in the past (${bookingData.eventDate}). Please choose a future date!`;
            } else {
              const conflict = await Booking.findOne({
                eventDate: {
                  $gte: startOfDay(target),
                  $lte: endOfDay(target),
                },
                status: { $ne: "canceled" },
              }).lean();

              if (conflict) {
                if (conflict.clientEmail.toLowerCase() === bookingData.clientEmail.toLowerCase()) {
                  reply = `Wait, Jick! You already have a booking for this date (${bookingData.eventDate}) with ID **${conflict.bookingId}**. Did you want to book another package, or were you just checking?`;
                } else {
                  reply = `I'm very sorry! It looks like someone just snatched that date (${bookingData.eventDate}) while we were chatting. 😔 Would you like to try another date?`;
                }
              } else {
                // 2. Generate professional ID
                const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                const bookingId = `BKG-${todayStr}-${random}`;

                // 3. Create the booking record
                const booking = await Booking.create({
                  ...bookingData,
                  bookingId,
                  status: "pending",
                  eventDate: target,
                });

                // 3.1 Link/Upgrade Client to "existing"
                try {
                  await Client.findOneAndUpdate(
                    { email: bookingData.clientEmail.toLowerCase() },
                    {
                      $set: {
                        name: bookingData.clientName,
                        phone: bookingData.clientPhone,
                        type: "existing",
                        lastBookingId: bookingId
                      }
                    },
                    { upsert: true }
                  );
                } catch (cErr) {
                  console.error("[Booking API] Failed to sync Client:", cErr);
                }

                // 4. Create Notification for Admin
                try {
                  await Notification.create({
                    type: "new_booking",
                    message: `New booking request from ${bookingData.clientName} for ${bookingData.eventType}`,
                    link: `/admin/bookings/${String(booking._id)}`,
                  });
                } catch (nErr) {
                  console.error("[Chat API] Failed to create notification:", nErr);
                }

                // 5. Fire & Forget Notifications (Emails & Socket)
                const formattedDate = format(target, "PPP");

                // Email to Client
                sendMail({
                  to: bookingData.clientEmail,
                  subject: "BOOK.ME - Booking Received",
                  html: EmailTemplates.bookingReceived(bookingData.clientName, formattedDate, bookingData.eventTime, bookingId),
                }).catch(console.error);

                // Email to Admin
                if (process.env.ADMIN_EMAIL) {
                  sendMail({
                    to: process.env.ADMIN_EMAIL,
                    subject: "🚨 [ADMIN] New Booking Alert",
                    html: EmailTemplates.adminBookingReceived(bookingData.clientName, formattedDate, bookingData.eventTime, bookingData.eventType, bookingId),
                  }).catch(console.error);
                }

                // Socket.IO Emission to Admin
                try {
                  const { io: socketClient } = await import("socket.io-client");
                  const { getBaseUrl } = await import("@/lib/utils/base-url");
                  const socket = socketClient(getBaseUrl(), { path: "/api/socketio", addTrailingSlash: false });
                  socket.on("connect", () => {
                    socket.emit("new-booking", booking);
                    socket.emit("new-notification", {
                      type: "new_booking",
                      message: `New booking request from ${bookingData.clientName} for ${bookingData.eventType}`,
                    });
                    setTimeout(() => socket.disconnect(), 1000);
                  });
                } catch (sErr) {
                  console.error("[Chat API] Failed to emit socket event:", sErr);
                }

                // 6. Success message
                reply = reply.replace(/\[\[BOOK_CMD: .*?\]\]/s, "").trim();
                reply += `\n\n✅ **Booking Success!** I have registered your request. Your reference ID is **${bookingId}**. Our team will review everything and contact you shortly. We're excited to help make your event special! 🎉`;
              }
            }
          }
        }
      } catch (cmdError) {
        console.error("[API] Failed to process booking command:", cmdError);
        reply = "I encountered a small technical hiccup while processing your booking. Could you please try again in a moment? 🛠️";
      }
    }


    // --- Record Analytics & Conversation (Background) ---
    if (sessionId) {
      (async () => {
        try {
          const today = startOfDay(new Date());

          // 1. Log Visitor Stats
          await VisitorStats.findOneAndUpdate(
            { date: today },
            {
              $inc: { count: 1 },
              $addToSet: { uniqueSessions: sessionId }
            },
            { upsert: true, new: true }
          );

          // 2. Log Conversation History
          // We record the last user message and the current assistant reply
          const lastUserMessage = messages[messages.length - 1];
          if (lastUserMessage) {
            await Conversation.findOneAndUpdate(
              { sessionId },
              {
                $push: {
                  messages: {
                    $each: [
                      { role: "user", content: lastUserMessage.content, timestamp: new Date() },
                      { role: "assistant", content: reply, timestamp: new Date() }
                    ]
                  }
                },
                $set: {
                  lastMessageAt: new Date(),
                  status: "active",
                  ...(extractedName || extractedEmail ? {
                    clientInfo: {
                      ...(extractedName ? { name: extractedName } : {}),
                      ...(extractedEmail ? { email: extractedEmail } : {})
                    }
                  } : {})
                }
              },
              { upsert: true }
            );

            // Notify Admin UI to refresh Chat Manager dynamically
            try {
              const { io: socketClient } = await import("socket.io-client");
              const { getBaseUrl } = await import("@/lib/utils/base-url");
              const socket = socketClient(getBaseUrl(), { path: "/api/socketio", addTrailingSlash: false });
              socket.on("connect", () => {
                socket.emit("chat-updated", { sessionId, name: extractedName, email: extractedEmail });
                setTimeout(() => socket.disconnect(), 1000);
              });
            } catch (sErr) {
              console.error("[Chat API] Failed to emit socket event:", sErr);
            }
          }
        } catch (analyticsError) {
          console.error("[Analytics] Error logging data:", analyticsError);
        }
      })();
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("[API] POST /api/chat error:", error);
    return NextResponse.json({ error: "Chat service unavailable." }, { status: 500 });
  }
}

