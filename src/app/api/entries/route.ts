import { NextRequest, NextResponse } from "next/server";
import { getEntries } from "@/lib/entryService";

// GET method handler
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
