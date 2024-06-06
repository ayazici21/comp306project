import {balanceSheet, incomeStatement} from '@/lib/statements'
import {NextResponse} from "next/server";

export const balanceSheetHandler = async (userId: number) => {
    try {
        const data = await balanceSheet(userId);
        return NextResponse.json(data, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}