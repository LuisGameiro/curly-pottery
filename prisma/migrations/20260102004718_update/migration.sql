/*
  Warnings:

  - You are about to drop the column `depthCm` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `glazes` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `heightCm` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `widthCm` on the `ProductVariant` table. All the data in the column will be lost.
  - The `sizeName` column on the `ProductVariant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "depthCm",
DROP COLUMN "glazes",
DROP COLUMN "heightCm",
DROP COLUMN "widthCm",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "discounts" JSONB,
DROP COLUMN "sizeName",
ADD COLUMN     "sizeName" TEXT;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "admin" BOOLEAN NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_sizeName_colorName_key" ON "ProductVariant"("productId", "sizeName", "colorName");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_id_fkey" FOREIGN KEY ("id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
