import prisma from "@/lib/prismaClient";
import bcrypt from "bcrypt";
import {NextRequest, NextResponse} from "next/server";

export const POST = async (req: NextRequest) => {
    const {username, email, password} = await req.json();

    let usernameUnique = await isUsernameUnique(username);
    let emailUnique = await isEmailUnique(email);
    if (!usernameUnique) {
        return NextResponse.json({error: "Username already exists"}, {status: 409});
    } else if (!emailUnique) {
        return NextResponse.json({error: "Email already exists"}, {status: 409});
    }

    const hashed = await bcrypt.hash(password, 10)

    let user = await storeUser({username: username, email: email, password_hashed: hashed});
    if (user === null) {
        return NextResponse.json({error: "An error occurred"}, {status: 500});
    } else {
        return NextResponse.json({success: true}, {status: 201});
    }


}

const storeUser = async (data: {username: string, email: string, password_hashed: string}) => {
    return prisma.user.create({
        data: data
    });
}

const isUsernameUnique = async (username: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {username: username}
    })
    return user === null;
}

const isEmailUnique = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {email: email}
    })

    return user === null;
}