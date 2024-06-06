import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface EquityEntry {
  name: string;
  item_type: 'DEBIT' | 'CREDIT';
  total: number;
}

interface EquityItem {
  Name: string;
  ItemType: 'Debit' | 'Credit';
  ItemValue: number;
}

const getOwnersEquity = async (userId: number): Promise<EquityItem[]> => {
  const ownerCapitalQuery = `
    SELECT 'Owner Capital' AS name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND LOWER(a.name) LIKE '%capital%'
    GROUP BY ei.item_type;
  `;

  const ownerContributionQuery = `
    SELECT 'Owner Contribution' AS name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND LOWER(a.name) LIKE '%contribution%'
    GROUP BY ei.item_type;
  `;

  const ownerWithdrawalQuery = `
    SELECT 'Owner Withdrawal' AS name, ei.item_type, SUM(ei.value) AS total
    FROM Account a
    JOIN EntryItem ei ON a.id = ei.account_ref
    JOIN UserAccount ua ON a.id = ua.id
    WHERE ua.uid = ? AND LOWER(a.name) LIKE '%withdrawal%'
    GROUP BY ei.item_type;
  `;

  const ownerCapital: EquityEntry[] = await prisma.$queryRawUnsafe(ownerCapitalQuery, userId);
  const ownerContribution: EquityEntry[] = await prisma.$queryRawUnsafe(ownerContributionQuery, userId);
  const ownerWithdrawal: EquityEntry[] = await prisma.$queryRawUnsafe(ownerWithdrawalQuery, userId);

  const formatResults = (entries: EquityEntry[]): EquityItem[] => {
    const result: EquityItem[] = [];
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
        Name: name,
        ItemType: balance >= 0 ? 'Debit' : 'Credit',
        ItemValue: Math.abs(balance)
      });
    });

    return result;
  };

  const ownersEquity = [
    ...formatResults(ownerCapital),
    ...formatResults(ownerContribution),
    ...formatResults(ownerWithdrawal)
  ];

  return ownersEquity;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = parseInt(req.query.userId as string);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const ownersEquity = await getOwnersEquity(userId);
    res.status(200).json(ownersEquity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
