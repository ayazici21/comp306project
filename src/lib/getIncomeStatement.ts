import prisma from "@/lib/prismaClient"


type AccountEntry = {
    name: string;
    type: 'DEBIT' | 'CREDIT';
    total: number;
}

type IncomeStatementItem = {
    accountName: string;
    type: 'DEBIT' | 'CREDIT';
    value: number;
}

const getIncomeStatement = async (userId: number): Promise<IncomeStatementItem[]> => {
    const revenueAccountsQuery = `
    SELECT a.name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND LOWER(a.name) LIKE '%revenue%'
    GROUP BY a.name, ei.item_type;
  `;

    const expenseAccountsQuery = `
    SELECT a.name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND LOWER(a.name) LIKE '%expense%'
    GROUP BY a.name, ei.item_type;
  `;

    const revenues: AccountEntry[] = await prisma.$queryRawUnsafe(revenueAccountsQuery, userId);
    const expenses: AccountEntry[] = await prisma.$queryRawUnsafe(expenseAccountsQuery, userId);

    const formatResults = (accounts: AccountEntry[]): IncomeStatementItem[] => {
        const result: IncomeStatementItem[] = [];
        const balanceMap = new Map<string, number>();

        accounts.forEach(account => {
            const {name, type, total} = account;
            if (!balanceMap.has(name)) {
                balanceMap.set(name, 0);
            }
            if (type === 'DEBIT') {
                balanceMap.set(name, balanceMap.get(name)! + total);
            } else {
                balanceMap.set(name, balanceMap.get(name)! - total);
            }
        });

        balanceMap.forEach((balance, name) => {
            result.push({
                accountName: name,
                type: balance >= 0 ? 'DEBIT' : 'CREDIT',
                value: Math.abs(balance)
            });
        });

        return result;
    };

    return [
        ...formatResults(revenues),
        ...formatResults(expenses)
    ];
};