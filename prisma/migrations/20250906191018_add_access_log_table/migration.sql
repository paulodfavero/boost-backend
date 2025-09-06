-- CreateTable
CREATE TABLE "access_logs" (
    "id" TEXT NOT NULL DEFAULT nanoid(11),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "location" TEXT,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
