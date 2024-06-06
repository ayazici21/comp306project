import prisma from "@/lib/prismaClient"

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

export const getEntries = async (userId: number): Promise<EntryData[]> => {
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
}

export const addEntry = async (
    userId: number,
    date: Date,
    entries: { accountName: string; value: number; isDebit: boolean }[]
): Promise<{ success: boolean; message: string }> => {
    try {
        return await prisma.$transaction(async (prisma) => {
            const entry = await prisma.entry.create({
                data: {
                    owner_id: userId,
                    date_entered: date,
                },
            });

            for (const item of entries) {
                const account = await prisma.account.findUnique({
                    where: {name: item.accountName},
                });

                if (!account) {
                    throw new Error(`Unknown account name: ${item.accountName}`);
                }

                await prisma.entryItem.create({
                    data: {
                        entry_ref: entry.id,
                        account_ref: account.id,
                        value: item.value,
                        item_type: item.isDebit ? 'DEBIT' : 'CREDIT',
                    },
                });
            }

            return {success: true, message: "Entry created successfully"};
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {success: false, message: `Error: ${error.message}`};
        } else {
            return {success: false, message: "An unknown error occurred"};
        }
    }
}