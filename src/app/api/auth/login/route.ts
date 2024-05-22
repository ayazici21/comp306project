import {getUser} from "@/lib/auth"
import {NextRequest, NextResponse} from "next/server";
import * as jwtUtils from "@/lib/jwtUtils"
import bcrypt from "bcrypt";

export const POST = async (req: NextRequest) => {
    try {
        const {usernameOrEmail, password}: {usernameOrEmail: string, password: string} = await req.json();
        let username, email;

        if (usernameOrEmail.includes("@")) {
            username = null;
            email = usernameOrEmail;
        } else {
            username = usernameOrEmail;
            email = null;
        }

        const user = await getUser(username, email)

        if (user === null) {
            NextResponse.json({error: "Invalid credentials"}, {status: 401});
        } else if (user.password_hashed === null) {
            return NextResponse.json({error: "Something went wrong"}, {status: 500});
        } else {
            const value = await bcrypt.compare(password, user.password_hashed)

            if (value) {
                let res = NextResponse.json<object>({username: user.username, email: user.email}, {status: 200});

                try {
                    res.cookies.set({
                        name: "jwt",
                        value: await jwtUtils.createToken({username: user.username, email: email}),
                        httpOnly: true,
                        path: "/"
                    })
                } catch (e) {
                    res = NextResponse.json({error: "An error occurred"}, {status: 500});
                }

                return res;

            } else {
                return NextResponse.json({error: "Invalid credentials"}, {status: 401})
            }

        }

    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Something went wrong"}, {status: 500});
    }

    throw new Error("How did we get here?")
}
