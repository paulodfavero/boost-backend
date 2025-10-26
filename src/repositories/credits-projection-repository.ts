import { CreditsProjection, Prisma } from '@prisma/client'

type CreditsProjectionWithBank = CreditsProjection & {
  bank?: { name: string; name_alias?: string } | null
}

interface CreditsProjectionUpdateRepository {
  id: string
  expirationDate?: string | Date | null
  description?: string | null
  company?: string | null
  category?: string | null
  amount?: number | null
  typePayment?: string | null
  operationType?: string | null
  paymentData?: string | null
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean | null
  organizationId: string
  bankId?: string | null
}

export interface CreditsProjectionRepository {
  searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ): Promise<CreditsProjectionWithBank[]>
  searchCardList(organizationId: string): Promise<CreditsProjection[]>
  createMany(
    data: Prisma.Enumerable<Prisma.CreditsProjectionCreateManyInput>,
  ): Promise<object>
  update(data: CreditsProjectionUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
  deleteMany(bankId: string): Promise<object>
  deleteManyByOrganization(organizationId: string): Promise<object>
}
