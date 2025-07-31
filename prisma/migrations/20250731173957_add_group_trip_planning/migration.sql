/*
  Warnings:

  - You are about to drop the column `userId` on the `Trip` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('OWNER', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_userId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "userId",
ADD COLUMN     "destination" TEXT NOT NULL DEFAULT 'Unknown Destination',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled Trip',
ALTER COLUMN "budget" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TripMembership" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TripRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripMembership_tripId_userId_key" ON "TripMembership"("tripId", "userId");

-- AddForeignKey
ALTER TABLE "TripMembership" ADD CONSTRAINT "TripMembership_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMembership" ADD CONSTRAINT "TripMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
