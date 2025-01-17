-- CreateTable
CREATE TABLE "EmailUsage" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "emailCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailUsage_id_key" ON "EmailUsage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmailUsage_userId_month_year_key" ON "EmailUsage"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "EmailUsage" ADD CONSTRAINT "EmailUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
