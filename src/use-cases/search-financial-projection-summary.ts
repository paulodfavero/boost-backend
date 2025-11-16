import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { format, addMonths, parse, startOfMonth } from 'date-fns'

interface SearchFinancialProjectionSummaryUseCaseRequest {
  organizationId: string
  months?: number
  startMonth?: string
}

interface MonthlyData {
  month: string
  gains: number
  expenses: number
  credits: number
  balance: number
  transactionCount: {
    gains: number
    expenses: number
    credits: number
  }
}

export class SearchFinancialProjectionSummaryUseCase {
  constructor(
    private expensesProjectionRepository: ExpensesProjectionRepository,
    private gainsProjectionRepository: GainsProjectionRepository,
    private creditsProjectionRepository: CreditsProjectionRepository,
  ) {}

  async execute({
    organizationId,
    months = 12,
    startMonth,
  }: SearchFinancialProjectionSummaryUseCaseRequest): Promise<object> {
    // Determine start month: use provided startMonth or default to next month
    const today = new Date()
    const nextMonth = addMonths(startOfMonth(today), 1)
    const startDate = startMonth
      ? parse(startMonth, 'y/MM', new Date())
      : nextMonth
    // Calculate end month
    const endDate = addMonths(startDate, months - 1)

    // Format months for repository queries
    const startMonthStr = format(startDate, 'y/MM')
    const endMonthStr = format(endDate, 'y/MM')

    // Fetch all projections for the period
    const [expenses, gains, credits] = await Promise.all([
      this.expensesProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        startMonthStr,
        endMonthStr,
      ),
      this.gainsProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        startMonthStr,
        endMonthStr,
      ),
      this.creditsProjectionRepository.searchMany(
        organizationId,
        undefined,
        undefined,
        startMonthStr,
        endMonthStr,
      ),
    ])

    // Group transactions by month
    const monthlyMap = new Map<string, MonthlyData>()

    // Initialize all months in the range
    for (let i = 0; i < months; i++) {
      const monthDate = addMonths(startDate, i)
      const monthStr = format(monthDate, 'y/MM')
      monthlyMap.set(monthStr, {
        month: monthStr,
        gains: 0,
        expenses: 0,
        credits: 0,
        balance: 0,
        transactionCount: {
          gains: 0,
          expenses: 0,
          credits: 0,
        },
      })
    }

    // Aggregate expenses by month
    expenses.forEach((expense) => {
      if (expense.isHidden) return
      const month = format(new Date(expense.expiration_date), 'y/MM')
      const monthData = monthlyMap.get(month)
      if (monthData) {
        monthData.expenses += expense.amount
        monthData.transactionCount.expenses += 1
      }
    })

    // Aggregate gains by month
    gains.forEach((gain) => {
      if (gain.isHidden) return
      const month = format(new Date(gain.expiration_date), 'y/MM')
      const monthData = monthlyMap.get(month)
      if (monthData) {
        monthData.gains += gain.amount
        monthData.transactionCount.gains += 1
      }
    })

    // Aggregate credits by month
    credits.forEach((credit) => {
      if (credit.isHidden) return
      const month = format(new Date(credit.expiration_date), 'y/MM')
      const monthData = monthlyMap.get(month)
      if (monthData) {
        monthData.credits += credit.amount
        monthData.transactionCount.credits += 1
      }
    })

    // Calculate balance for each month and totals
    let totalGains = 0
    let totalExpenses = 0
    let totalCredits = 0

    const monthlyData: MonthlyData[] = []

    for (let i = 0; i < months; i++) {
      const monthDate = addMonths(startDate, i)
      const monthStr = format(monthDate, 'y/MM')
      const monthData = monthlyMap.get(monthStr)!

      // Calculate balance: gains - expenses - credits
      monthData.balance =
        monthData.gains - monthData.expenses - monthData.credits

      // Accumulate totals
      totalGains += monthData.gains
      totalExpenses += monthData.expenses
      totalCredits += monthData.credits

      // Only include months with at least one transaction
      if (
        monthData.gains > 0 ||
        monthData.expenses > 0 ||
        monthData.credits > 0
      ) {
        monthlyData.push(monthData)
      }
    }

    const totalBalance = totalGains - totalExpenses - totalCredits

    return {
      summary: {
        totalGains,
        totalExpenses,
        totalCredits,
        totalBalance,
        period: {
          startMonth: startMonthStr,
          endMonth: endMonthStr,
          monthsCount: months,
        },
      },
      monthlyData,
    }
  }
}
