import prisma from "@/lib/prismaClient"

export const getAccounts = async (userId: number): Promise<{
    id: number;
    name: string;
    is_temp: boolean;
    liquidity: number;
    contra_of: string | undefined;
    type: string;
}[] | null> => {
    try {
        const userAccounts = await prisma.userAccount.findMany({
            where: {
                uid: userId,
            },
            include: {
                Account: {
                    include: {
                        Account: {
                            select: {
                                name: true,
                            },
                        },
                    }
                }
            }
        });

        return userAccounts.map(userAccount => ({
            id: userAccount.Account.id,
            name: userAccount.Account.name,
            is_temp: userAccount.Account.is_temp,
            liquidity: userAccount.Account.liquidity,
            contra_of: userAccount.Account.Account?.name,
            type: userAccount.Account.type as string,
        }));

    } catch (error) {
        console.error(error);
        return null;
    }
};
