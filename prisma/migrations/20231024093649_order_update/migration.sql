-- CreateTable
CREATE TABLE `customer` (
    `customerId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNo` VARCHAR(15) NOT NULL,
    `active` TINYINT NOT NULL DEFAULT 1,
    `lastLogin` TIMESTAMP(0) NOT NULL,
    `loginAttempts` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `customer_username_key`(`username`),
    UNIQUE INDEX `customer_email_key`(`email`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `ordersId` VARCHAR(191) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `timestamp` TIMESTAMP(0) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'delivered') NOT NULL,
    `deliveryAddress` VARCHAR(255) NOT NULL,

    INDEX `orders_customerId_fkey`(`customerId`),
    PRIMARY KEY (`ordersId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller` (
    `sellerId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `active` TINYINT NOT NULL DEFAULT 1,
    `lastLogin` TIMESTAMP(0) NOT NULL,
    `loginAttempts` INTEGER NOT NULL,
    `phoneNo` VARCHAR(15) NOT NULL,

    UNIQUE INDEX `seller_username_key`(`username`),
    UNIQUE INDEX `seller_email_key`(`email`),
    PRIMARY KEY (`sellerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menucategory` (
    `menuCategoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`menuCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menuitem` (
    `menuItemId` VARCHAR(191) NOT NULL,
    `image` VARCHAR(255) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `popular` TINYINT NOT NULL DEFAULT 0,
    `menuCategoryId` INTEGER NOT NULL,

    INDEX `menuItem_menuCategoryId_fkey`(`menuCategoryId`),
    PRIMARY KEY (`menuItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderitems` (
    `ordersId` CHAR(36) NOT NULL,
    `menuItemId` CHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `totalPrice` DECIMAL(10, 2) NOT NULL,

    INDEX `orderItems_menuItemId_fkey`(`menuItemId`),
    PRIMARY KEY (`ordersId`, `menuItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`customerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menuitem` ADD CONSTRAINT `menuItem_menuCategoryId_fkey` FOREIGN KEY (`menuCategoryId`) REFERENCES `menucategory`(`menuCategoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitems` ADD CONSTRAINT `orderItems_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem`(`menuItemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitems` ADD CONSTRAINT `orderItems_ordersId_fkey` FOREIGN KEY (`ordersId`) REFERENCES `orders`(`ordersId`) ON DELETE RESTRICT ON UPDATE CASCADE;
