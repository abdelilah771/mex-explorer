/*
  Warnings:

  - The `status` column on the `TripMembership` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "TripMembership" DROP COLUMN "status",
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "TripInvitationStatus";
