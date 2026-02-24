import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/db";
import Event from "@/lib/models/Event";
import Settings from "@/lib/models/Settings";
import Booking from "@/lib/models/Booking";
import Conversation from "@/lib/models/Conversation";
import VisitorStats from "@/lib/models/VisitorStats";
import { startOfDay, endOfDay } from "date-fns";

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

    // --- Availability check if date provided ---
    let availabilityContext = "";
    if (checkDate) {
      try {
        const target = new Date(checkDate);
        const conflict = await Booking.findOne({
          eventDate: {
            $gte: startOfDay(target),
            $lte: endOfDay(target),
          },
          status: { $ne: "canceled" },
        }).lean();
        availabilityContext = conflict
          ? `\n\n## Availability Result\nThe date ${checkDate} is **NOT AVAILABLE** — it is already booked.`
          : `\n\n## Availability Result\nThe date ${checkDate} is **AVAILABLE** — this slot is open for booking!`;
      } catch {
        availabilityContext = "\n\n## Availability Result\nUnable to check availability at this time.";
      }
    }

    // --- Build system prompt ---
    const systemPrompt = `
You are **Booky**, the friendly call-agent assistant for **Book.Me**, a premium event booking platform.

Your personality:
- Warm, professional, helpful — like a real call-center agent
- Address the customer by name if they tell you it
- Keep answers concise and clear
- Use emojis sparingly but naturally to stay friendly (e.g. 📅 for dates, 🎉 for events)
- Always sign off with your name if wrapping up a conversation

Your STRICT rules:
1. You ONLY answer questions related to Book.Me events, bookings, pricing, availability, contacts, policies, and how to book
2. You NEVER generate code, write programs, or answer technical/coding questions
3. You NEVER reveal admin data, booking records, or any data that requires authentication
4. You NEVER guess, hallucinate, or make up information not in your knowledge base
5. If asked something outside your scope, politely decline and redirect to booking topics
6. If you don't know something, say "I don't have that information right now, but you can contact us at [email/phone from settings]"

Your Knowledge Base:
${staticKnowledge}

${liveContext}
${availabilityContext}
`.trim();

    // --- Call Groq ---
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12), // Keep conversation window to last 12 messages
      ],
      max_tokens: 512,
      temperature: 0.5,
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

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
                $set: { lastMessageAt: new Date(), status: "active" }
              },
              { upsert: true }
            );
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

