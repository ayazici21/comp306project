import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface AccountEntry {
  name: string;
  item_type: 'DEBIT' | 'CREDIT';
  total: number;
}

interface IncomeStatementItem {
  ItemName: string;
  ItemType: 'Debit' | 'Credit';
  ItemValue: number;
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
      const { name, item_type, total } = account;
      if (!balanceMap.has(name)) {
        balanceMap.set(name, 0);
      }
      if (item_type === 'DEBIT') {
        balanceMap.set(name, balanceMap.get(name)! + total);
      } else {
        balanceMap.set(name, balanceMap.get(name)! - total);
      }
    });

    balanceMap.forEach((balance, name) => {
      result.push({
        ItemName: name,
        ItemType: balance >= 0 ? 'Debit' : 'Credit',
        ItemValue: Math.abs(balance)
      });
    });

    return result;
  };

  const incomeStatement = [
    ...formatResults(revenues),
    ...formatResults(expenses)
  ];

  return incomeStatement;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = parseInt(req.query.userId as string);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const incomeStatement = await getIncomeStatement(userId);
    res.status(200).json(incomeStatement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
