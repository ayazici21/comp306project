import { NextRequest, NextResponse } from "next/server";
import { getEntries, addEntry } from "@/lib/entry";

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    try {
        const entries = await getEntries(parseInt(userId));
        return NextResponse.json(entries, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    const { userId, date, entries } = await req.json();

    if (!userId || !date || !entries) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    try {
        const result = await addEntry(
            parseInt(userId), new Date(date), entries
        );

        if (result.success) {
            return NextResponse.json(result, {status: 200})
        } else {
            return NextResponse.json(result, {status: 400})
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
