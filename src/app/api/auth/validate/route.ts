import {NextRequest, NextResponse} from "next/server";
import {validateToken} from "@/lib/jwtUtils";

export const POST = async (req: NextRequest) => {
    const auth = req.headers.get("Authorization");
    if (!auth) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const token = auth.split(" ")[1];
    if (!token || !(await validateToken(token))) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

}