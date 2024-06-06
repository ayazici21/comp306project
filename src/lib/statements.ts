import prisma from "@/lib/prismaClient"
import { Prisma } from "@prisma/client";

type Revenues = {
    accountName: string,
    total: number
}[];

type Expenses = {
    accountName: string,
    total: number
}[]

type Assets = {
    accountName: string,
    total: number
}[];

type Liabilities = {
    accountName: string,
    total: number
}[]

type Equity = {
    accountName: string,
    total: number
}[]

export const incomeStatement = async (userId: number): Promise<{
    revenues: Revenues,
    totalRevenues: number,
    expenses: Expenses,
    totalExpenses: number,
    netIncome: number
}> => {
    const revenueQuery = Prisma.sql`
        SELECT A.name, SUM(
            cases
                when EI.item_type = 'DEBIT' then EI.value
                when EI.item_type = 'CREDIT' then -EI.value
            end
        ) as total
        FROM Account A
        JOIN EntryItem EI ON A.id = ei.account_ref
        JOIN UserAccount UA on A.id = UA.id
        WHERE UA.uid = ? AND LOWER(A.name) LIKE '%revenue%'
        GROUP BY A.name;`;

    const expenseQuery = Prisma.sql`
        SELECT A.name, SUM(
            cases
                when EI.item_type = 'DEBIT' then EI.value
                when EI.item_type = 'CREDIT' then -EI.value
            end
        ) as total
        FROM Account A
        JOIN EntryItem EI ON A.id = ei.account_ref
        JOIN UserAccount UA on A.id = UA.id
        WHERE UA.uid = ? AND LOWER(A.name) LIKE '%expense%'
        GROUP BY A.name;`

    const revenues: Revenues = await prisma.$queryRaw(revenueQuery, userId);
    const expenses: Expenses = await prisma.$queryRaw(expenseQuery, userId);

    const totalRevenues = revenues.reduce((acc, { total }) => acc + total, 0);
    const totalExpenses = expenses.reduce((acc, { total }) => acc + total, 0);

    return {
        revenues,
        totalRevenues,
        expenses,
        totalExpenses,
        netIncome: totalRevenues - totalExpenses
    }
}


const ownersEquity = async (userId: number): Promise<{
    beginningCapital: number,
    netIncome: number,
    contribution: number,
    withdrawal: number,
    endingCapital: number
}> => {
    const {netIncome} = await incomeStatement(userId);

    const contributionQuery = Prisma.sql`
        SELECT SUM(*) AS total
        FROM Account Account
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ? AND LOWER(A.name) LIKE '%capital%'
    `

    const withdrawalQuery = Prisma.sql`
        SELECT SUM(*) AS total
        FROM Account Account
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ? AND LOWER(A.name) LIKE '%withdrawal%'
    `

    const contribution: {total: number}[] = await prisma.$queryRaw(contributionQuery, userId);
    const withdrawal: {total: number}[] = await prisma.$queryRaw(withdrawalQuery, userId);

    const totalContribution = contribution.reduce((acc, { total }) => acc + total, 0);
    const totalWithdrawals = withdrawal.reduce((acc, { total }) => acc + total, 0);

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

const balanceSheet = async (userId: number): Promise<{
    assets: Assets
    totalAssets: number,
    liabilities: Liabilities,
    totalLiabilities: number,
    equity: Equity,
    totalLiabilitiesAndEquity: number
}> => {
    const assetsQuery = Prisma.sql`
        SELECT a.name, SUM(
            CASES
                WHEN EI.item_type = 'DEBIT' THEN EI.value
                WHEN EI.item_type = 'CREDIT' THEN -EI.value
            END
        )
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ? AND A.type = 'ASSET'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const liabilitiesQuery = Prisma.sql`
        SELECT a.name, SUM(
            CASES
                WHEN EI.item_type = 'DEBIT' THEN EI.value
                WHEN EI.item_type = 'CREDIT' THEN -EI.value
            END
        )
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ? AND A.type = 'LIABILITY'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const equityQuery = Prisma.sql`
        SELECT a.name, SUM(
            CASES
                WHEN EI.item_type = 'DEBIT' THEN EI.value
                WHEN EI.item_type = 'CREDIT' THEN -EI.value
            END
        )
        FROM Account A
        JOIN EntryItem EI ON A.id = EI.account_ref
        JOIN UserAccount UA ON A.id = UA.id
        WHERE UA.uid = ? AND A.type = 'EQUITY'
        GROUP BY A.name
        ORDER BY A.liquidity DESC;
    `

    const assets: Assets = await prisma.$queryRaw(assetsQuery, userId);
    const liabilities: Liabilities = await prisma.$queryRaw(liabilitiesQuery, userId);
    const equity: Equity = await prisma.$queryRaw(equityQuery, userId);

    const totalAssets = assets.reduce((acc, { total }) => acc + total, 0);
    const totalLiabilities = liabilities.reduce((acc, { total }) => acc + total, 0);
    const totalEquity = equity.reduce((acc, { total }) => acc + total, 0);

    return {
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        equity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    }
}