-- CreateEnum
CREATE TYPE "TripInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "TripMembership" ADD COLUMN     "status" "TripInvitationStatus" NOT NULL DEFAULT 'PENDING';
