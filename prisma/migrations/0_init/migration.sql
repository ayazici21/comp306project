-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `is_temp` BOOLEAN NULL DEFAULT false,
    `liquidity` INTEGER NULL,
    `contra_of` INTEGER NULL,
    `type` INTEGER NULL,

    UNIQUE INDEX `name`(`name`),
    INDEX `contra_of`(`contra_of`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountType` (
    `type` INTEGER NOT NULL,
    `name` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Entry` (
    `id` INTEGER NOT NULL,
    `owner_id` INTEGER NULL,
    `date_entered` DATE NOT NULL,

    INDEX `owner_id`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EntryItem` (
    `entry_ref` INTEGER NOT NULL,
    `account_ref` INTEGER NOT NULL,
    `item_type` INTEGER NULL,
    `value` INTEGER NOT NULL,

    INDEX `account_ref`(`account_ref`),
    PRIMARY KEY (`entry_ref`, `account_ref`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EntryItemType` (
    `type` INTEGER NOT NULL,
    `name` VARCHAR(64) NULL,

    PRIMARY KEY (`type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvalidToken` (
    `token_id` INTEGER NOT NULL,
    `exp` DATE NOT NULL,

    PRIMARY KEY (`token_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL,
    `username` VARCHAR(64) NOT NULL,
    `email` VARCHAR(64) NOT NULL,
    `password_hashed` VARCHAR(64) NOT NULL,
    `salt` VARCHAR(64) NULL,

    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_ibfk_1` FOREIGN KEY (`contra_of`) REFERENCES `Account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Entry` ADD CONSTRAINT `Entry_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `EntryItem` ADD CONSTRAINT `EntryItem_ibfk_1` FOREIGN KEY (`entry_ref`) REFERENCES `Entry`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `EntryItem` ADD CONSTRAINT `EntryItem_ibfk_2` FOREIGN KEY (`account_ref`) REFERENCES `Account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

