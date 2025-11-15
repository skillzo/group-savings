-- AlterTable
ALTER TABLE "Pack" ADD COLUMN     "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "Pack" ADD CONSTRAINT "Pack_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
