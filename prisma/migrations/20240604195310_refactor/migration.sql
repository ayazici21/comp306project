/*
  Warnings:

  - You are about to drop the `AccountType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryItemType` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `is_temp` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `liquidity` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Account` MODIFY `is_temp` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `liquidity` INTEGER NOT NULL DEFAULT 0,
    MODIFY `type` ENUM('ASSET', 'LIABILITY', 'EQUITY') NOT NULL;

-- DropTable
DROP TABLE `AccountType`;

-- DropTable
DROP TABLE `EntryItemType`;
