import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface BalanceEntry {
  name: string;
  item_type: 'DEBIT' | 'CREDIT';
  total: number;
}

interface BalanceSheetItem {
  AccountName: string;
  EntryName: string;
  ItemType: 'Debit' | 'Credit';
  ItemValue: number;
}

const getBalanceSheet = async (userId: number): Promise<BalanceSheetItem[]> => {
  const assetsQuery = `
    SELECT 'Asset' AS account_type, a.name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND a.type = 'ASSET'
    GROUP BY a.name, ei.item_type
    ORDER BY a.liquidity DESC;
  `;

  const liabilitiesQuery = `
    SELECT 'Liability' AS account_type, a.name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND a.type = 'LIABILITY'
    GROUP BY a.name, ei.item_type;
  `;

  const assets: BalanceEntry[] = await prisma.$queryRawUnsafe(assetsQuery, userId);
  const liabilities: BalanceEntry[] = await prisma.$queryRawUnsafe(liabilitiesQuery, userId);

  const formatResults = (entries: BalanceEntry[], accountType: string): BalanceSheetItem[] => {
    const result: BalanceSheetItem[] = [];
    const balanceMap = new Map<string, number>();

    entries.forEach(entry => {
      const { name, item_type, total } = entry;
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
        AccountName: accountType,
        EntryName: name,
        ItemType: balance >= 0 ? 'Debit' : 'Credit',
        ItemValue: Math.abs(balance)
      });
    });

    return result;
  };

  const balanceSheet = [
    ...formatResults(assets, 'Asset'),
    ...formatResults(liabilities, 'Liability')
  ];

  return balanceSheet;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = parseInt(req.query.userId as string);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const balanceSheet = await getBalanceSheet(userId);
    res.status(200).json(balanceSheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
