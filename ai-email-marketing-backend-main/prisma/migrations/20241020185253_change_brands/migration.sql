/*
  Warnings:

  - Added the required column `updated_at` to the `Brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brands" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
