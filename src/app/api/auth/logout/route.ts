import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {invalidateToken} from "@/lib/jwtUtils";

export const POST = async (req: NextRequest) => {
    try {
        if (cookies().get("jwt") === undefined) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        await invalidateToken(cookies().get("jwt")!.value);

        cookies().delete("jwt");

        return NextResponse.json({}, {status: 200});
    } catch (e) {
        console.log(e)
        return NextResponse.json({error: (e as Error).message}, {status: 500})
    }
}