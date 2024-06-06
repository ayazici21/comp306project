import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const balances = await prisma.$queryRaw`
      SELECT
        Account.name as accountName,
        Account.type as accountType,
        SUM(CASE WHEN EntryItem.item_type = 'DEBIT' THEN EntryItem.value ELSE 0 END) as debit,
        SUM(CASE WHEN EntryItem.item_type = 'CREDIT' THEN EntryItem.value ELSE 0 END) as credit
      FROM Account
      LEFT JOIN EntryItem ON Account.id = EntryItem.account_ref
      GROUP BY Account.name, Account.type
      ORDER BY 
        CASE 
          WHEN Account.type = 'ASSET' THEN 1
          WHEN Account.type = 'LIABILITY' THEN 2
          WHEN Account.type = 'EQUITY' THEN 3
          ELSE 4
        END
    `;
    
    return NextResponse.json(balances, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch T Balances' }, { status: 500 });
  }
}
