import { Expense, Prisma } from '@prisma/client'

interface ExpenseUpdateRepository {
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  groupInstallmentId?: string
  paid?: boolean
  organizationId: string
  bankId?: string
}

export interface ExpensesRepository {
  searchMany(organizationId: string, date: string): Promise<Expense[]>
  createMany(
    data: Prisma.Enumerable<Prisma.ExpenseCreateManyInput>,
  ): Promise<object>
  update(data: ExpenseUpdateRepository): Promise<object>
  delete(transactionId: string): Promise<object>
}
