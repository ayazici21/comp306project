import prisma from "@/lib/prismaClient"

export const getAccountTotal = async (userId: number, accountName: string): Promise<{ status: boolean, total: number }> => {
    try {
        const result = await prisma.$queryRaw<{ total: number }[]>`
            SELECT SUM(
                CASE
                    WHEN EI.item_type = "DEBIT" THEN EI.value
                    WHEN EI.item_type = "CREDIT" THEN -EI.value
                END
            ) AS total
            FROM EntryItem EI
            JOIN Account A ON A.id = EI.account_ref
            JOIN Entry E ON E.id = EI.entry_ref
            JOIN User U ON U.id = E.owner_id
            JOIN UserAccount UA ON UA.id = A.id AND UA.uid = U.id
            WHERE U.id = ${userId}
              AND A.name = ${accountName}
        `;

        const total = result[0]?.total || 0;
        return { status: true, total };
    } catch (error) {
        console.error(error);
        return { status: false, total: 0 };
    }
};
