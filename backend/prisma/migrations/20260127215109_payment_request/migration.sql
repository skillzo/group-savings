-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "PackMember" ADD COLUMN     "interestAmount" INTEGER,
ADD COLUMN     "interestDueRound" INTEGER,
ADD COLUMN     "owesInterest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "requestorId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "requestedAmount" INTEGER NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentRequest_packId_idx" ON "PaymentRequest"("packId");

-- CreateIndex
CREATE INDEX "PaymentRequest_requestorId_idx" ON "PaymentRequest"("requestorId");

-- CreateIndex
CREATE INDEX "PaymentRequest_payerId_idx" ON "PaymentRequest"("payerId");

-- CreateIndex
CREATE INDEX "PaymentRequest_packId_status_idx" ON "PaymentRequest"("packId", "status");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
