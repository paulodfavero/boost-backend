import { ExpensesRepository } from '@/repositories/expense-repository'
import {
  CreditsRepository,
  CreditWithBank,
} from '@/repositories/credit-repository'
import { format, subMonths, getDate } from 'date-fns'
import {
  BanksRepository,
  BanksTypeAccountRepository,
} from '@/repositories/bank-repository'
import { Expense } from '@prisma/client'

interface SearchRecurrentBillsUseCaseRequest {
  organizationId: string
  bankId?: string
}

interface RecurrentBill {
  id: string
  expirationDate: Date | string | null
  purchaseDate: Date | string | null
  balanceCloseDate: Date | string | null
  description: string
  company: string | null
  category: string | null
  amount: number
  typePayment: string
  installmentCurrent: number | null
  installmentTotalPayment: number | null
  groupInstallmentId: string | null
  paid: boolean
  bank: any
  bankTypeAccount: any
  recurrenceCount: number
  months: string[]
  transactionType: 'expense' | 'credit'
}

type Transaction = (Expense | CreditWithBank) & {
  transactionType: 'expense' | 'credit'
}

export class SearchRecurrentBillsUseCase {
  constructor(
    private ExpensesRepository: ExpensesRepository,
    private CreditsRepository: CreditsRepository,
    private BankRepository: BanksRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    bankId,
  }: SearchRecurrentBillsUseCaseRequest): Promise<object> {
    // Calculate 5 months period: 5 months before today
    const today = new Date()
    const startMonth = format(subMonths(today, 4), 'y/MM')
    const endMonth = format(today, 'y/MM')

    // Fetch all expenses and credits from the last 5 months
    const [allExpenses, allCredits] = await Promise.all([
      this.ExpensesRepository.searchMany(
        organizationId,
        '',
        bankId,
        startMonth,
        endMonth,
      ),
      this.CreditsRepository.searchMany(
        organizationId,
        '',
        bankId,
        startMonth,
        endMonth,
      ),
    ])

    // Combine expenses and credits into a single array with transaction type
    const allTransactions: (Transaction & {
      transactionType: 'expense' | 'credit'
    })[] = [
      ...allExpenses.map((expense) => ({
        ...expense,
        transactionType: 'expense' as const,
      })),
      ...allCredits.map((credit) => ({
        ...credit,
        transactionType: 'credit' as const,
      })),
    ]

    // Group transactions by description + category + expiration day
    // The expiration_date can vary, but we validate if the majority is the same day
    const transactionMap = new Map<
      string,
      {
        transactions: typeof allTransactions
        months: Set<string>
        expirationDays: number[] // Store the day of month for each transaction
      }
    >()

    allTransactions.forEach((transaction) => {
      if (!transaction.expiration_date) return

      const expirationDate = new Date(transaction.expiration_date)
      const month = format(expirationDate, 'y/MM')
      const dayOfMonth = getDate(expirationDate)
      const key = `${transaction.description || ''}|${
        transaction.category || ''
      }`

      if (!transactionMap.has(key)) {
        transactionMap.set(key, {
          transactions: [],
          months: new Set(),
          expirationDays: [],
        })
      }

      const entry = transactionMap.get(key)!
      entry.transactions.push(transaction)
      entry.months.add(month)
      entry.expirationDays.push(dayOfMonth)
    })

    // Filter transactions that appear in multiple months and validate expiration_date
    const recurrentBills: RecurrentBill[] = []

    for (const [
      key,
      { transactions, months, expirationDays },
    ] of transactionMap.entries()) {
      if (months.size > 1) {
        // Validate if the majority of transactions have the same expiration day
        // Count occurrences of each day
        const dayCounts = new Map<number, number>()
        expirationDays.forEach((day) => {
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
        })

        // Find the most common day
        let maxCount = 0
        let mostCommonDay = 0
        for (const [day, count] of dayCounts.entries()) {
          if (count > maxCount) {
            maxCount = count
            mostCommonDay = day
          }
        }

        // Check if the most common day represents the majority (more than 50%)
        const majorityThreshold = transactions.length / 2
        if (maxCount > majorityThreshold) {
          // Get the most recent transaction as representative
          const representative = transactions.sort(
            (a, b) =>
              new Date(b.expiration_date || 0).getTime() -
              new Date(a.expiration_date || 0).getTime(),
          )[0]

          const bankTypeAccount = representative.bankTypeAccountId
            ? await this.BankTypeAccountRepository.findById(
                representative.bankTypeAccountId,
              )
            : null

          const bank = representative.bankId
            ? await this.BankRepository.findById(representative.bankId)
            : null

          recurrentBills.push({
            id: representative.id,
            expirationDate: representative.expiration_date,
            purchaseDate: representative.purchase_date || null,
            balanceCloseDate: representative.balance_close_date || null,
            description: representative.description || '',
            company: representative.company || null,
            category: representative.category,
            amount: representative.amount,
            typePayment: representative.type_payment,
            installmentCurrent: representative.installment_current || null,
            installmentTotalPayment:
              representative.installment_total_payment || null,
            groupInstallmentId: representative.group_installment_id || null,
            paid: representative.paid,
            bank,
            bankTypeAccount,
            recurrenceCount: months.size,
            months: Array.from(months).sort(),
            transactionType: representative.transactionType,
          })
        }
      }
    }

    // Sort by recurrence count (descending) and then by description
    recurrentBills.sort((a, b) => {
      if (b.recurrenceCount !== a.recurrenceCount) {
        return b.recurrenceCount - a.recurrenceCount
      }
      return (a.description || '').localeCompare(b.description || '')
    })

    return {
      result: recurrentBills,
    }
  }
}
