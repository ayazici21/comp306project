import {NextRequest, NextResponse} from "next/server";

import {balanceSheetHandler} from "@/app/api/financial-statements/balanceSheet";
import {ownersEquityHandler} from "@/app/api/financial-statements/ownersEquity";
import {incomeStatementHandler} from "@/app/api/financial-statements/incomeStatement";

export const GET = async (req: NextRequest) => {
    const url = new URL(req.nextUrl);
    const userId = url.searchParams.get('userId');
    const type = url.searchParams.get('type');

    if (!userId) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (!type) {
        return NextResponse.json({ error: "Invalid statement type" }, { status: 400 });
    }

    let uid: number;
    try {
        uid = parseInt(userId)
    } catch(error) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    switch (type) {
        case 'income-statement':
            return incomeStatementHandler(uid);
        case 'balance-sheet':
            return balanceSheetHandler(uid);
        case 'owners-equity':
            return ownersEquityHandler(uid);
        default:
            return NextResponse.json({ error: "Invalid statement type" }, { status: 400 })
    }
}