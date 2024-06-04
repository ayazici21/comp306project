import {SignJWT, jwtVerify, JWTPayload} from "jose";
import * as crypto from "crypto";
import prisma from "@/lib/prismaClient"
import {JWTExpired, JWTInvalid} from "jose/errors";

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY!);

export const createToken = async (payload: JWTPayload) => {

    return await new SignJWT(payload)
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("2d")
        .setJti(crypto.randomBytes(32).toString())
        .sign(secretKey)
}

export const invalidateToken = async (token: string) => {
    // if the token is currently valid and not expired, add it to the invalid token table. store the jti and expiration time of the payload
    try {
        const {payload} = await jwtVerify(token, secretKey);
        await prisma.invalidToken.create({
            data: {
                token_id: payload.jti!,
                exp: new Date(payload.exp! * 1000)
            }
        })
    } catch (error) {
        if (error instanceof JWTInvalid || error instanceof JWTExpired) {
            return;
        }
        console.log(error)
    }

}

export const validateToken = async (token: string) => {
    try {
        const {payload} = await jwtVerify(token, secretKey);
        const isInvalid = await prisma.invalidToken.findFirst({
            where: {
                token_id: payload.jti!
            }
        });
        return !isInvalid;
    } catch (error) {
        if (error instanceof JWTInvalid || error instanceof JWTExpired) {
            return false;
        }
        console.log(error)
        return false;
    }
}