import {NextResponse} from "next/server";
import {ownersEquity} from "@/lib/statements";

export const ownersEquityHandler = async (userId: number) => {
    try {
        const data = await ownersEquity(userId);
        return NextResponse.json(data, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}