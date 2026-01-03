/*
  Warnings:

  - You are about to drop the column `customerId` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_customerId_fkey";

-- DropIndex
DROP INDEX "Account_customerId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "customerId";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_accountId_key" ON "Customer"("accountId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
