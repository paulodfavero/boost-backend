-- This is an empty migration.

-- Primeiro, vamos atualizar os registros que têm bankItemId mas não têm bankId
UPDATE "bankTypeAccount" bta
SET "bankId" = b.id
FROM "banks" b
WHERE bta."bankItemId" = b."item_id"
AND bta."bankId" IS NULL;

-- Agora vamos tornar a coluna bankId nullable
ALTER TABLE "bankTypeAccount" 
ALTER COLUMN "bankId" DROP NOT NULL;

-- Adicionamos a foreign key com ON DELETE SET NULL
ALTER TABLE "bankTypeAccount" 
DROP CONSTRAINT IF EXISTS "bankTypeAccount_bankId_fkey",
ADD CONSTRAINT "bankTypeAccount_bankId_fkey" 
FOREIGN KEY ("bankId") 
REFERENCES "banks"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;