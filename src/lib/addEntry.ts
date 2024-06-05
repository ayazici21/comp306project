import prisma from "@/lib/prismaClient";

async function addEntry(
    userId: number,
    date: Date,
    entries: { accountName: string; value: number; isDebit: boolean }[]
): Promise<{ success: boolean; message: string }> {
    try {
        const transaction = await prisma.$transaction(async (prisma) => {
            const entry = await prisma.entry.create({
                data: {
                    owner_id: userId,
                    date_entered: date,
                },
            });

            for (const item of entries) {
                const account = await prisma.account.findUnique({
                    where: { name: item.accountName },
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

            return { success: true, message: "Entry created successfully" };
        });

        return transaction;
    } catch (error:unknown) {
        if (error instanceof Error) {
            return { success: false, message: `Error: ${error.message}` };
        }else{
            return { success: false, message: "An unknown error occurred" };
        }
    }
}

export default addEntry;
