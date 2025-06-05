-- Atualiza os dados existentes (se houver)
UPDATE "bankTypeAccount" bta
SET "bankId" = b.id
FROM "banks" b
WHERE bta."bankItemId" = b."item_id"
AND bta."bankId" IS NULL;

-- Adiciona a foreign key (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'bankTypeAccount_bankId_fkey'
    ) THEN
        ALTER TABLE "bankTypeAccount"
        ADD CONSTRAINT "bankTypeAccount_bankId_fkey"
        FOREIGN KEY ("bankId")
        REFERENCES "banks"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Remove a coluna antiga, se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='bankTypeAccount' AND column_name='bankItemId'
    ) THEN
        ALTER TABLE "bankTypeAccount" DROP COLUMN "bankItemId";
    END IF;
END $$;
