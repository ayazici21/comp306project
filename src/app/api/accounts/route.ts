import {getAccounts} from "@/lib/getAccounts";
import {NextRequest, NextResponse} from "next/server";
import {addAccount, Status} from "@/lib/addAccount";

export const GET = async (req: NextRequest) => {
    const url = new URL(req.nextUrl);
    const userId = url.searchParams.get('uid');

    if (userId === null) {
        return NextResponse.json({error: "Missing uid"}, {status: 400});
    }

    const accounts = await getAccounts(parseInt(userId));

    if (accounts === null) {
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }

    return NextResponse.json(accounts, {status: 200});
}

export const POST = async (req: NextRequest) => {
    const {uid, accountName, isTemp, liquidity, contraAcctName, type} = await req.json();

    if (uid === undefined || accountName === undefined || isTemp === undefined || liquidity === undefined || type === undefined) {
        return NextResponse.json({error: "Missing parameters"}, {status: 400});
    }

    const status = await addAccount(uid, accountName, isTemp, liquidity, contraAcctName, type);

    if (status === Status.SUCCESS) {
        return NextResponse.json({status: "success"}, {status: 200});
    } else if (status === Status.EXISTS) {
        return NextResponse.json({error: "Account already exists"}, {status: 409});
    } else if (status === Status.FAILED) {
        return NextResponse.json({error: "Failed to create account"}, {status: 500});
    } else if (status === Status.NO_CONTRA_ACCOUNT) {
        return NextResponse.json({error: "Contra account does not exist"}, {status: 400});
    } else if (status === Status.EXISTS_USER) {
        return NextResponse.json({error: "Account already exists"}, {status: 400});
    } else {
        return NextResponse.json({error: "An unknown error has occurred"}, {status: 500});
    }
}