/*
  Warnings:

  - The primary key for the `InvalidToken` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `InvalidToken` DROP PRIMARY KEY,
    MODIFY `token_id` CHAR(32) NOT NULL,
    ADD PRIMARY KEY (`token_id`);
