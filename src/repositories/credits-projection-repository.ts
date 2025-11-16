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
  isHidden?: boolean | null
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
  findById(transactionId: string): Promise<CreditsProjection | null>
  update(data: CreditsProjectionUpdateRepository): Promise<object>
  updateManyByGroupId(
    groupInstallmentId: string,
    data: {
      description?: string | null
      category?: string | null
      amount?: number | null
      paid?: boolean | null
      isHidden?: boolean | null
      company?: string | null
      type_payment?: string | null
      installment_total_payment?: number | null
      organizationId?: string
    },
  ): Promise<object>
  delete(transactionId: string): Promise<object>
  deleteManyByGroupId(
    groupInstallmentId: string,
    organizationId: string,
  ): Promise<object>
  deleteMany(bankId: string): Promise<object>
  deleteManyByOrganization(organizationId: string): Promise<object>
}
