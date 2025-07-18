/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `promoCode` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RedeemedReward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BadgeToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'CONFIRMED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('DISCOUNT', 'FREE_UPGRADE', 'EXCLUSIVE_OFFER');

-- DropForeignKey
ALTER TABLE "RedeemedReward" DROP CONSTRAINT "RedeemedReward_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "RedeemedReward" DROP CONSTRAINT "RedeemedReward_userId_fkey";

-- DropForeignKey
ALTER TABLE "_BadgeToUser" DROP CONSTRAINT "_BadgeToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BadgeToUser" DROP CONSTRAINT "_BadgeToUser_B_fkey";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "isAvailable",
DROP COLUMN "promoCode",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "partnerName" TEXT,
ADD COLUMN     "type" "RewardType" NOT NULL;

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "RedeemedReward";

-- DropTable
DROP TABLE "_BadgeToUser";

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "travelStartDate" TIMESTAMP(3) NOT NULL,
    "travelEndDate" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "souvenirType" TEXT,
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RewardToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RewardToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RewardToUser_B_index" ON "_RewardToUser"("B");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RewardToUser" ADD CONSTRAINT "_RewardToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RewardToUser" ADD CONSTRAINT "_RewardToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
