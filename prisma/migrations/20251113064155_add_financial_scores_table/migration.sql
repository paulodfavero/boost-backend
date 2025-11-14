-- CreateTable
CREATE TABLE "financial_scores" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "score" INTEGER NOT NULL,
    "evolution" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "financial_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_scores_organizationId_key" ON "financial_scores"("organizationId");

-- AddForeignKey
ALTER TABLE "financial_scores" ADD CONSTRAINT "financial_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

