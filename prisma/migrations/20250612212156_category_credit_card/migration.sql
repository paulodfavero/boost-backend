-- CreateTable
CREATE TABLE "categoriesCreditCard" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "descriptionTranslated" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "subCategoriesCreditCard" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "descriptionTranslated" TEXT NOT NULL,
    "parentDescription" TEXT NOT NULL,
    "categoryCreditCardId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "initiation_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoriesCreditCard_id_key" ON "categoriesCreditCard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "subCategoriesCreditCard_id_key" ON "subCategoriesCreditCard"("id");

-- AddForeignKey
ALTER TABLE "subCategoriesCreditCard" ADD CONSTRAINT "subCategoriesCreditCard_categoryCreditCardId_fkey" FOREIGN KEY ("categoryCreditCardId") REFERENCES "categoriesCreditCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
