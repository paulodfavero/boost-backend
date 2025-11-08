import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { BanksRepository } from '@/repositories/bank-repository'
import { Bank } from '@prisma/client'
import { format, parse, startOfMonth } from 'date-fns'

// Helper function to format date to ISO 8601 with -03:00 timezone
function formatDateWithTimezone(date: Date): string {
  const isoString = date.toISOString()
  // Replace Z or +00:00 with -03:00
  return isoString.replace(/Z$/, '-03:00').replace(/\+00:00$/, '-03:00')
}

interface SearchFinancialProjectionMonthDetailsUseCaseRequest {
  organizationId: string
  month: string
}

interface FormattedTransaction {
  id: string
  description: string
  amount: number
  category: string | null
  expirationDate: string
  purchaseDate: string | null
  paid: boolean
  type: 'expense' | 'gain' | 'credit'
  company: string
  typePayment: string
  bank: {
    id: string
    name: string
    imageUrl?: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export class SearchFinancialProjectionMonthDetailsUseCase {
  constructor(
    private expensesProjectionRepository: ExpensesProjectionRepository,
    private gainsProjectionRepository: GainsProjectionRepository,
    private creditsProjectionRepository: CreditsProjectionRepository,
    private bankRepository: BanksRepository,
  ) {}

  async execute({
    organizationId,
    month,
  }: SearchFinancialProjectionMonthDetailsUseCaseRequest): Promise<object> {
    // Parse month string to date
    const monthDate = parse(month, 'y/MM', new Date())

    // Format for repository queries
    const monthStr = format(monthDate, 'y/MM')

    // Fetch all projections for the month
    const [expenses, gains, credits] = await Promise.all([
      this.expensesProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        monthStr,
        monthStr,
      ),
      this.gainsProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        monthStr,
        monthStr,
      ),
      this.creditsProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        monthStr,
        monthStr,
      ),
    ])

    // Filter only future projections (expiration_date >= today)
    const todayStart = startOfMonth(new Date())
    const futureExpenses = expenses.filter(
      (exp) => new Date(exp.expiration_date) >= todayStart,
    )
    const futureGains = gains.filter(
      (gain) => new Date(gain.expiration_date) >= todayStart,
    )
    const futureCredits = credits.filter(
      (credit) => new Date(credit.expiration_date) >= todayStart,
    )

    // Format expenses
    const formattedExpenses: FormattedTransaction[] = await Promise.all(
      futureExpenses.map(async (expense) => {
        const bank = expense.bankId
          ? ((await this.bankRepository.findById(
              expense.bankId,
            )) as Bank | null)
          : null

        return {
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          expirationDate: formatDateWithTimezone(
            new Date(expense.expiration_date),
          ),
          purchaseDate: expense.purchase_date
            ? formatDateWithTimezone(new Date(expense.purchase_date))
            : null,
          paid: expense.paid,
          type: 'expense' as const,
          company: expense.company,
          typePayment: expense.type_payment,
          bank: bank
            ? {
                id: bank.id || '',
                name: bank.name || '',
                imageUrl: bank.image_url || null,
              }
            : null,
          createdAt: formatDateWithTimezone(new Date(expense.created_at)),
          updatedAt: formatDateWithTimezone(new Date(expense.created_at)),
        }
      }),
    )
    formattedExpenses.sort(
      (a, b) =>
        new Date(b.expirationDate).getTime() -
        new Date(a.expirationDate).getTime(),
    )

    // Format gains
    const formattedGains: FormattedTransaction[] = await Promise.all(
      futureGains.map(async (gain) => {
        const bank = gain.bankId
          ? ((await this.bankRepository.findById(gain.bankId)) as Bank | null)
          : null

        return {
          id: gain.id,
          description: gain.description,
          amount: gain.amount,
          category: gain.category,
          expirationDate: formatDateWithTimezone(
            new Date(gain.expiration_date),
          ),
          purchaseDate: gain.purchase_date
            ? formatDateWithTimezone(new Date(gain.purchase_date))
            : null,
          paid: gain.paid,
          type: 'gain' as const,
          company: gain.company,
          typePayment: gain.type_payment,
          bank: bank
            ? {
                id: bank.id || '',
                name: bank.name || '',
                imageUrl: bank.image_url || null,
              }
            : null,
          createdAt: formatDateWithTimezone(new Date(gain.created_at)),
          updatedAt: formatDateWithTimezone(new Date(gain.created_at)),
        }
      }),
    )
    formattedGains.sort(
      (a, b) =>
        new Date(b.expirationDate).getTime() -
        new Date(a.expirationDate).getTime(),
    )

    // Format credits (credits already include bank relation)
    const formattedCredits: FormattedTransaction[] = futureCredits
      .map((credit) => ({
        id: credit.id,
        description: credit.description,
        amount: credit.amount,
        category: credit.category,
        expirationDate: formatDateWithTimezone(
          new Date(credit.expiration_date),
        ),
        purchaseDate: credit.purchase_date
          ? formatDateWithTimezone(new Date(credit.purchase_date))
          : null,
        paid: credit.paid,
        type: 'credit' as const,
        company: credit.company,
        typePayment: credit.type_payment,
        bank: credit.bank
          ? {
              id: credit.bankId || '',
              name: credit.bank.name || '',
              imageUrl: null,
            }
          : null,
        createdAt: formatDateWithTimezone(new Date(credit.created_at)),
        updatedAt: formatDateWithTimezone(new Date(credit.created_at)),
      }))
      .sort(
        (a, b) =>
          new Date(b.expirationDate).getTime() -
          new Date(a.expirationDate).getTime(),
      )

    // Calculate totals
    const totalGains = formattedGains.reduce((sum, g) => sum + g.amount, 0)
    const totalExpenses = formattedExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    )
    const totalCredits = formattedCredits.reduce((sum, c) => sum + c.amount, 0)
    const totalBalance = totalGains - totalExpenses - totalCredits

    return {
      month: monthStr,
      expenses: formattedExpenses,
      gains: formattedGains,
      credits: formattedCredits,
      totals: {
        gains: totalGains,
        expenses: totalExpenses,
        credits: totalCredits,
        balance: totalBalance,
      },
    }
  }
}
