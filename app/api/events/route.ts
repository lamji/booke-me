import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/lib/models/Event";
import { eventSchema } from "@/lib/validation/event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Internal server error.";
}

function getErrorCode(error: unknown): number | undefined {
    if (error !== null && typeof error === "object" && "code" in error) {
        return (error as { code: number }).code;
    }
    return undefined;
}

export async function GET(req: Request) {
    try {
        await connectDB();
        
        // Public list of active events for the booking page
        const { searchParams } = new URL(req.url);
        const adminMode = searchParams.get("admin") === "true";

        if (adminMode) {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const events = await Event.find().sort({ name: 1 });
            return NextResponse.json(events);
        }

        const events = await Event.find({ isActive: true }).sort({ name: 1 });
        return NextResponse.json(events);
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = eventSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const event = await Event.create(validation.data);
        return NextResponse.json(event, { status: 201 });
    } catch (error: unknown) {
        if (getErrorCode(error) === 11000) {
            return NextResponse.json({ error: "An event with this name already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
