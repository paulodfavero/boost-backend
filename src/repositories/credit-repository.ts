import { Credit, Prisma, Bank } from '@prisma/client'

type CreditWithBank = Credit & {
  bank: Bank | null
}

interface CreditUpdateRepository {
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  operationType?: string
  paymentData?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean
  organizationId: string
}

export interface CreditsRepository {
  searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ): Promise<CreditWithBank[]>
  searchCardList(organizationId: string): Promise<Credit[]>
  createMany(
    data: Prisma.Enumerable<Prisma.CreditCreateManyInput>,
  ): Promise<object>
  update(data: CreditUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
  deleteMany(bankId: string): Promise<object>
}
