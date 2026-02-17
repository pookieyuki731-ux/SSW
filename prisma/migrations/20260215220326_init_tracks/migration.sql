-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LapEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "racingAlias" TEXT NOT NULL,
    "crewName" TEXT,
    "carName" TEXT NOT NULL,
    "stageLevel" TEXT NOT NULL,
    "lapTimeMs" INTEGER NOT NULL,
    "lapTimeDisplay" TEXT NOT NULL,
    "clipUrl" TEXT,
    "verifiedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LapEntry_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LapEntry_trackId_lapTimeMs_idx" ON "LapEntry"("trackId", "lapTimeMs");

-- CreateIndex
CREATE INDEX "LapEntry_trackId_racingAlias_idx" ON "LapEntry"("trackId", "racingAlias");
