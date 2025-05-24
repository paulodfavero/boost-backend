import { Expense, Prisma } from '@prisma/client'

interface ExpenseUpdateRepository {
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
  groupInstallmentId?: string
  paid?: boolean
  organizationId: string
  bankId?: string
}

export interface ExpensesRepository {
  searchMany(organizationId: string, date?: string, monthStart?: string, monthEnd?: string): Promise<Expense[]>
  createMany(
    data: Prisma.Enumerable<Prisma.ExpenseCreateManyInput>,
  ): Promise<object>
  update(data: ExpenseUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
  deleteMany(bankId: string): Promise<object>
}
