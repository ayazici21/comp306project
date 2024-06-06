import prisma from "@/lib/prismaClient";
import {AccountType, Prisma} from "@prisma/client";
import XOR = Prisma.XOR;
import AccountCreateInput = Prisma.AccountCreateInput;
import AccountUncheckedCreateInput = Prisma.AccountUncheckedCreateInput;

export enum Status {
    SUCCESS,
    EXISTS,
    FAILED,
    NO_CONTRA_ACCOUNT,
    EXISTS_USER,
}

export const addAccount = async (
    userId: number,
    accountName: string,
    isTemp: boolean,
    liquidity: number,
    contraAcctName: string | null,
    type: string
): Promise<Status> => {
    let accountId: number;
    try {
        const existingAccount = await prisma.account.findUnique({
            where: {
                name: accountName,
            },
        });

        if (existingAccount) {
            const contraAccount = contraAcctName ? await prisma.account.findUnique({
                where: {
                    name: contraAcctName,
                },
            }) : null;

            if (existingAccount.is_temp !== isTemp
                || existingAccount.liquidity !== liquidity
                || existingAccount.contra_of !== contraAccount?.id
                || existingAccount.type !== type) {
                return Status.EXISTS;
            }

            accountId = existingAccount.id;
        } else {
            let data: XOR<AccountCreateInput, AccountUncheckedCreateInput> = {
                name: accountName,
                is_temp: isTemp,
                liquidity: liquidity,
                type: type as AccountType,
            }

            if (contraAcctName) {
                const contraAccount = await prisma.account.findUnique({
                    where: {name: contraAcctName},
                });
                if (contraAccount === null) {
                    return Status.NO_CONTRA_ACCOUNT;
                }
                data.contra_of = contraAccount.id;
            }

            const newAccount = await prisma.account.create({
                data: data
            });

            accountId = newAccount.id;
        }

        try {
            await prisma.userAccount.create({
                data: {
                    id: accountId,
                    uid: userId,
                },
            });
        } catch (error) {
            return Status.EXISTS_USER;
        }
        return Status.SUCCESS;
    } catch (error) {
        console.error(error);
        return Status.FAILED;
    }
};

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
export const getAccountTotal = async (userId: number, accountName: string): Promise<{
    status: boolean,
    total: number
}> => {
    try {
        const result = await prisma.$queryRaw<{ total: number }[]>`
            SELECT SUM(
                CASE
                    WHEN EI.item_type = "DEBIT" THEN EI.value
                    WHEN EI.item_type = "CREDIT" THEN -EI.value
                END
            ) AS total
            FROM EntryItem EI
            JOIN Account A ON A.id = EI.account_ref
            JOIN Entry E ON E.id = EI.entry_ref
            JOIN User U ON U.id = E.owner_id
            JOIN UserAccount UA ON UA.id = A.id AND UA.uid = U.id
            WHERE U.id = ${userId}
              AND A.name = ${accountName}
        `;

        const total = result[0]?.total || 0;
        return {status: true, total};
    } catch (error) {
        console.error(error);
        return {status: false, total: 0};
    }
};