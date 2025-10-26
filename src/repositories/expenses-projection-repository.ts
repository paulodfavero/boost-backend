import { ExpensesProjection, Prisma } from '@prisma/client'

interface ExpensesProjectionUpdateRepository {
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

export interface ExpensesProjectionRepository {
  searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ): Promise<ExpensesProjection[]>
  createMany(
    data: Prisma.Enumerable<Prisma.ExpensesProjectionCreateManyInput>,
  ): Promise<object>
  update(data: ExpensesProjectionUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
  deleteMany(bankId: string): Promise<object>
  deleteManyByOrganization(organizationId: string): Promise<object>
}
