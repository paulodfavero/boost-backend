import { Gain, Prisma } from '@prisma/client'

interface GainUpdateRepository {
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

export interface GainsRepository {
  searchMany(organizationId: string, date?: string, monthStart?: string, monthEnd?: string): Promise<Gain[]>
  createMany(
    data: Prisma.Enumerable<Prisma.GainCreateManyInput>,
  ): Promise<object>
  update(data: GainUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
}
