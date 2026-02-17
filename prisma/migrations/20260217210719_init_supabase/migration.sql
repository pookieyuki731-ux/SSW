-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LapEntry" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "racingAlias" TEXT NOT NULL,
    "crewName" TEXT,
    "carName" TEXT NOT NULL,
    "stageLevel" TEXT NOT NULL,
    "lapTimeMs" INTEGER NOT NULL,
    "lapTimeDisplay" TEXT NOT NULL,
    "clipUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LapEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LapEntry_trackId_lapTimeMs_idx" ON "LapEntry"("trackId", "lapTimeMs");

-- CreateIndex
CREATE INDEX "LapEntry_trackId_racingAlias_idx" ON "LapEntry"("trackId", "racingAlias");

-- AddForeignKey
ALTER TABLE "LapEntry" ADD CONSTRAINT "LapEntry_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
