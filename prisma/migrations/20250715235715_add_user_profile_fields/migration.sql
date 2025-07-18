-- CreateEnum
CREATE TYPE "TravelStyle" AS ENUM ('LUXURY', 'ADVENTURE', 'RELAXATION', 'CULTURAL', 'BUDGET');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityLevel" "ActivityLevel",
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "travelStyle" "TravelStyle";
