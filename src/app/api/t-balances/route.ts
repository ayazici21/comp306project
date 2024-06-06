import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') || '0', 10);

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const balances = await prisma.$queryRaw<TBalance[]>`
      SELECT
        A.name as accountName,
        A.type as accountType,
        SUM(CASE WHEN EI.item_type = 'DEBIT' THEN EI.value ELSE 0 END) as debit,
        SUM(CASE WHEN EI.item_type = 'CREDIT' THEN EI.value ELSE 0 END) as credit
      FROM Account A
      JOIN EntryItem EI ON A.id = EI.account_ref
      JOIN UserAccount UA ON A.id = UA.id
      WHERE UA.uid = ${userId}
      GROUP BY A.name, A.type
      ORDER BY 
        CASE 
          WHEN A.type = 'ASSET' THEN 1
          WHEN A.type = 'LIABILITY' THEN 2
          WHEN A.type = 'EQUITY' THEN 3
          ELSE 4
        END
    `;

    console.log(balances); // Log the raw results

    if (balances.length === 0) {
      return NextResponse.json({ message: 'No available options' }, { status: 404 });
    }

    return NextResponse.json(balances, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch T Balances' }, { status: 500 });
  }
}

type TBalance = {
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
};
