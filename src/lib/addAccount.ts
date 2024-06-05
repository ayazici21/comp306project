import AccountCreateInput = Prisma.AccountCreateInput;
import AccountUncheckedCreateInput = Prisma.AccountUncheckedCreateInput;
import XOR = Prisma.XOR;
import {AccountType, Prisma} from '@prisma/client';

import prisma from "@/lib/prismaClient"

export enum Status {
    SUCCESS,
    EXISTS,
    FAILED,
    NO_CONTRA_ACCOUNT,
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
        await prisma.userAccount.create({
            data: {
                id: accountId,
                uid: userId,
            },
        });

        return Status.SUCCESS;
    } catch (error) {
        console.error(error);
        return Status.FAILED;
    }
};
