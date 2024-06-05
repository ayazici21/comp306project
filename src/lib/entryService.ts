import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type EntryItemData = {
  accountName: string;
  value: number;
  isDebit: boolean;
};

type EntryData = {
  entryId: number;
  date: Date;
  entries: EntryItemData[];
};

export async function getEntries(userId: number): Promise<EntryData[]> {
  // Fetch entries and their items for the given user
  const entries = await prisma.entry.findMany({
    where: {
      owner_id: userId,
    },
    include: {
      EntryItem: {
        include: {
          Account: true,
        },
      },
    },
    orderBy: {
      date_entered: 'desc',
    },
  });

  // Structure the data
  const structuredEntries: EntryData[] = entries.map((entry) => {
    const entryItems: EntryItemData[] = entry.EntryItem.map((item) => ({
      accountName: item.Account.name,
      value: item.value,
      isDebit: item.item_type === 'DEBIT',
    }));

    // Sort entry items: debits first, then credits
    entryItems.sort((a, b) => {
      if (a.isDebit && !b.isDebit) return -1;
      if (!a.isDebit && b.isDebit) return 1;
      return 0;
    });

    return {
      entryId: entry.id,
      date: entry.date_entered,
      entries: entryItems,
    };
  });

  return structuredEntries;
}
