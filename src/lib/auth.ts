import prisma from "@/lib/prismaClient"
import {Prisma} from "@prisma/client";
export const getUser = (username: string | null, email: string | null) => {
    let where: Prisma.UserWhereInput;
    if (username !== null && email === null) {
        where = {
            username: username
        };
    } else if (username === null && email !== null) {
        where = {
            email: email
        };
    } else if (username === null && email === null) { // for easy testing
        where = {
            username: "test"
        }
    } else {
        where = {
            AND: [
                {username: username!},
                {email: email!}
            ]
        }
    }

    return prisma.user.findFirst({
        where: where
    })
}
