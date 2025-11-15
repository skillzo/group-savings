-- AlterTable
ALTER TABLE "Pack" ADD COLUMN     "currentContributions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalContributions" INTEGER NOT NULL DEFAULT 0;
