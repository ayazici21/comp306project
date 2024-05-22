import jwt, {JwtPayload, TokenExpiredError} from "jsonwebtoken"
import * as crypto from "crypto";
import prisma from "@/lib/prismaClient"

export const createToken = async (payload: object) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        jwtid: crypto.randomBytes(32).toString(),
        expiresIn: "2d",
    })
}

export const invalidateToken = async (token: string) => {
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!, {
            clockTolerance: 300
        }) as JwtPayload
    } catch (e) {
        if (e instanceof TokenExpiredError) {
            console.log('o wassup bro')
            return;
        } else {
            console.log(e);
        }
    }

    console.log(payload)
    await prisma.invalidToken.create({
        data: {
            token_id: payload!.jti!,
            exp: new Date(payload!.exp! * 1000)
        }
    })
}