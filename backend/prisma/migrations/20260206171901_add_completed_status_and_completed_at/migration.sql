-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "completedAt" TIMESTAMP(3);
