enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY"
}


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define constants for return statuses
export const RETURN_STATUS_SUCCESS = "success";
export const RETURN_STATUS_ACCOUNT_EXISTS_DIFFERENT_PROPERTIES = "account_exists_different_properties";
export const RETURN_STATUS_ACCOUNT_CREATION_FAILED = "account_creation_failed";
export const RETURN_STATUS_USER_ACCOUNT_ASSOCIATION_FAILED = "user_account_association_failed";

export const addAccount = async (
    userId: number,
    accountName: string,
    isTemp: boolean,
    liquidity: number,
    contraAcctName: string | null,
    type: AccountType // Update type to AccountType
): Promise<string> => {
    try {
        // Check if an account with the given name already exists
        const existingAccount = await prisma.account.findUnique({
            where: {
                name: accountName,
            },
        });

        // If the account exists, verify its properties
        if (existingAccount) {
            const contraAccount = contraAcctName ? await prisma.account.findUnique({
                where: {
                    name: contraAcctName,
                },
            }) : null;

            if (
                existingAccount.is_temp === isTemp &&
                existingAccount.liquidity === liquidity &&
                existingAccount.contra_of === contraAccount?.id && contraAccount?.id !== null &&
                existingAccount.type === existingAccount.type !== null && type in AccountType // Compare with AccountType
            ) {
                // If all properties match, add the account ID with the given user ID to the UserAccount table
                await prisma.userAccount.create({
                    data: {
                        id: existingAccount.id,
                        uid: userId,
                    },
                });

                return RETURN_STATUS_SUCCESS;
            } else {
                return RETURN_STATUS_ACCOUNT_EXISTS_DIFFERENT_PROPERTIES;
            }
        } else {
            // Find or create the contra account
            let contraAccountId: number | null = null;
            if (contraAcctName) {
                const contraAccount = await prisma.account.findUnique({
                    where: { name: contraAcctName },
                });
                if (contraAccount) {
                    contraAccountId = contraAccount.id;
                } else {
                    const newContraAccount = await prisma.account.create({
                        data: {
                            name: contraAcctName,
                            is_temp: true,
                            liquidity: 0,
                            type: existingAccount,  /////// NOT SURE ABOUT THE TYPE GOTTA CHECK
                        },
                    });
                    contraAccountId = newContraAccount.id;
                }
            }

            // Create a new account
            const newAccount = await prisma.account.create({
                data: {
                    name: accountName,
                    is_temp: isTemp,
                    liquidity: liquidity,
                    contra_of: contraAccountId,
                    type: existingAccount, /////// NOT SURE ABOUT THE TYPE GOTTA CHECK
                },
            });

            // Add the account ID and user ID to the UserAccount table
            await prisma.userAccount.create({
                data: {
                    id: newAccount.id,
                    uid: userId,
                },
            });

            return RETURN_STATUS_SUCCESS;
        }
    } catch (error) {
        console.error(error);
        return RETURN_STATUS_ACCOUNT_CREATION_FAILED;
    }
};
