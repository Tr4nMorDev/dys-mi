-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "playerXId" INTEGER NOT NULL,
    "playerOId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerXId_fkey" FOREIGN KEY ("playerXId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerOId_fkey" FOREIGN KEY ("playerOId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
