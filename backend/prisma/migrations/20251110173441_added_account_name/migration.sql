-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountName" TEXT,
ALTER COLUMN "accountNumber" DROP NOT NULL;
