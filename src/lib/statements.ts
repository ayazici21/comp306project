import prisma from "@/lib/prismaClient"
import { Prisma } from "@prisma/client";

export type Account = {
    accountName: string,
    total: number
}[];

export type IncomeStatement = {
    revenues: Account,
    totalRevenues: number,
    expenses: Account,
    totalExpenses: number,
    netIncome: number
}

export type OwnersEquity = {
    beginningCapital: number,
    netIncome: number,
    contribution: number,
    withdrawal: number,
    endingCapital: number
}

export type BalanceSheet = {
    assets: Account
    totalAssets: number,
    liabilities: Account,
    totalLiabilities: number,
    equity: Account,
    totalEquity: number,
    totalLiabilitiesAndEquity: number
}

export const incomeStatement = async (userId: number): Promise<IncomeStatement> => {
    const revenueQuery = Prisma.sql`
        SELECT A.name as accountName, 
               SUM(
                   CASE 
                       WHEN EI.item_type = 'DEBIT' THEN -EI.value
                       WHEN EI.item_type = 'CREDIT' THEN +EI.value
                   END
               ) AS total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        JOIN Entry E ON E.id = EI.entry_ref
        WHERE UA.uid = ${userId}
          AND LOWER(A.name) LIKE '%revenue%'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;`;

    const expenseQuery = Prisma.sql`
        SELECT A.name as accountName, 
               SUM(
                   CASE 
                       WHEN EI.item_type = 'DEBIT' THEN EI.value
                       WHEN EI.item_type = 'CREDIT' THEN -EI.value
                   END
               ) AS total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        JOIN Entry E ON E.id = EI.entry_ref
        WHERE UA.uid = ${userId}
          AND LOWER(A.name) LIKE '%expense%'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;`

    const revenues: Account = await prisma.$queryRaw(revenueQuery);
    const expenses: Account = await prisma.$queryRaw(expenseQuery);

    let totalRevenues = 0;

    revenues.forEach(({ total }) => totalRevenues += Number(total));

    let totalExpenses = 0;

    expenses.forEach(({ total }) => totalExpenses += Number(total));

    return {
        revenues,
        totalRevenues,
        expenses,
        totalExpenses,
        netIncome: totalRevenues - totalExpenses
    }
}


export const ownersEquity = async (userId: number): Promise<OwnersEquity> => {
    const {netIncome} = await incomeStatement(userId);

    const contributionQuery = Prisma.sql`
        SELECT SUM(
            CASE
                WHEN EI.item_type = 'DEBIT' THEN -EI.value
                WHEN EI.item_type = 'CREDIT' THEN EI.value
            END
        ) AS total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ${userId} AND LOWER(A.name) LIKE '%capital%'
    `

    const withdrawalQuery = Prisma.sql`
        SELECT SUM(
            CASE
                WHEN EI.item_type = 'DEBIT' THEN EI.value
                WHEN EI.item_type = 'CREDIT' THEN -EI.value
            END
        ) AS total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ${userId} AND LOWER(A.name) LIKE '%withdrawal%'
    `

    const contribution: {total: number}[] = await prisma.$queryRaw(contributionQuery, userId);
    const withdrawal: {total: number}[] = await prisma.$queryRaw(withdrawalQuery, userId);

    let totalContribution = 0;
    contribution.forEach(({ total }) => totalContribution += Number(total));

    const totalWithdrawals = 0;
    withdrawal.forEach(({ total }) => totalContribution += Number(total));

    const beginningCapital = 0;
    const endingCapital = beginningCapital + totalContribution + netIncome - totalWithdrawals;

    return {
        beginningCapital,
        netIncome,
        contribution: totalContribution,
        withdrawal: totalWithdrawals,
        endingCapital,
    }
}

export const balanceSheet = async (userId: number): Promise<BalanceSheet> => {
    const assetsQuery = Prisma.sql`
        SELECT A.name as accountName, SUM(
            CASE
                WHEN EI.item_type = 'DEBIT' THEN EI.value
                WHEN EI.item_type = 'CREDIT' THEN -EI.value
            END
        ) as total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ${userId} AND A.type = 'ASSET'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const liabilitiesQuery = Prisma.sql`
        SELECT A.name as accountName, SUM(
            CASE
                WHEN EI.item_type = 'DEBIT' THEN -EI.value
                WHEN EI.item_type = 'CREDIT' THEN EI.value
            END
        ) as total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ${userId} AND A.type = 'LIABILITY'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const equityQuery = Prisma.sql`
        SELECT A.name as accountName, SUM(
            CASE
                WHEN EI.item_type = 'DEBIT' THEN -EI.value
                WHEN EI.item_type = 'CREDIT' THEN EI.value
            END
        ) as total
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ${userId} AND A.type = 'EQUITY'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const assets: Account = await prisma.$queryRaw(assetsQuery);
    const liabilities: Account = await prisma.$queryRaw(liabilitiesQuery);
    const equity: Account = await prisma.$queryRaw(equityQuery);

    let totalAssets = 0;
    assets.forEach(({ total }) => totalAssets += Number(total));

    let totalLiabilities = 0;
    liabilities.forEach(({ total }) => totalLiabilities += Number(total));

    let totalEquity = 0;
    equity.forEach(({ total }) => totalEquity += Number(total));

    return {
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        equity,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    }
}