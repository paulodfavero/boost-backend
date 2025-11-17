import { ExpensesProjection, Prisma } from '@prisma/client'

interface ExpensesProjectionUpdateRepository {
  id: string
  expirationDate?: string | number | null // Apenas o dia (ex: "15" ou 15)
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
  findById(transactionId: string): Promise<ExpensesProjection | null>
  update(data: ExpensesProjectionUpdateRepository): Promise<object>
  updateManyByGroupId(
    groupInstallmentId: string,
    data: {
      expirationDate?: string | number | null // Apenas o dia (ex: "15" ou 15)
      description?: string | null
      category?: string | null
      amount?: number | null
      paid?: boolean | null
      isHidden?: boolean | null
      company?: string | null
      type_payment?: string | null
      installment_total_payment?: number | null
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
