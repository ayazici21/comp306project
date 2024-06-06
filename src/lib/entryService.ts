import prisma from "@/lib/prismaClient"

export type EntryItemData = {
    accountName: string;
    value: number;
    isDebit: boolean;
};

export type EntryData = {
    entryId: number;
    date: Date;
    entries: EntryItemData[];
};

export async function getEntries(userId: number): Promise<EntryData[]> {
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
    return entries.map((entry) => {
        const entryItems = entry.EntryItem.map((item) => ({
            accountName: item.Account.name,
            value: item.value,
            isDebit: item.item_type === 'DEBIT',
        }));

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
}
