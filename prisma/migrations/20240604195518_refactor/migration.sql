/*
  Warnings:

  - Made the column `owner_id` on table `Entry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `item_type` on table `EntryItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Entry` DROP FOREIGN KEY `Entry_ibfk_1`;

-- AlterTable
ALTER TABLE `Entry` MODIFY `owner_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `EntryItem` MODIFY `item_type` ENUM('DEBIT', 'CREDIT') NOT NULL;

-- AddForeignKey
ALTER TABLE `Entry` ADD CONSTRAINT `Entry_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
