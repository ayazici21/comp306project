import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAccounts = async (userId: number): Promise<any[]> => {
    try {
        // Fetch the user accounts
        const userAccounts = await prisma.userAccount.findMany({
            where: {
                uid: userId,
            },
            include: {
                Account: true,
            },
        });

        // Extract and return the account details
        const accounts = userAccounts.map(userAccount => ({
            id: userAccount.Account.id,
            name: userAccount.Account.name,
            is_temp: userAccount.Account.is_temp,
            liquidity: userAccount.Account.liquidity,
            contra_of: userAccount.Account.contra_of,
            type: userAccount.Account.type,
        }));

        return accounts;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch accounts');
    }
};
