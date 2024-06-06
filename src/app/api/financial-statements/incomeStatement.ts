import {incomeStatement} from "@/lib/statements";
import {NextResponse} from "next/server";

export const incomeStatementHandler = async (userId: number) => {
    try {
        const data = await incomeStatement(userId);
        return NextResponse.json(data, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}