-- DropForeignKey
ALTER TABLE "PackMember" DROP CONSTRAINT "PackMember_packId_fkey";

-- AddForeignKey
ALTER TABLE "PackMember" ADD CONSTRAINT "PackMember_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
