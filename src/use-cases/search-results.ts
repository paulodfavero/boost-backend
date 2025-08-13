import { CreditsRepository } from '@/repositories/credit-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { addMonths, format, subMonths } from 'date-fns'
import { Credit, Bank } from '@prisma/client'

type CreditWithBank = Credit & {
  bank: Bank | null
}

interface SearchExpensesUseCaseRequest {
  organizationId: string
  date: string
  bankId?: string
}

export class SearchResultsUseCase {
  constructor(
    private ExpensesRepository: ExpensesRepository,
    private GainsRepository: GainsRepository,
    private CreditRepository: CreditsRepository,
  ) {}

  async execute({
    organizationId,
    date,
    bankId,
  }: SearchExpensesUseCaseRequest): Promise<object> {
    // Calculate 12 months period: 6 months before and 5 months after the given date
    const startMonth = format(subMonths(new Date(date), 6), 'y/MM')
    const endMonth = format(addMonths(new Date(date), 5), 'y/MM')

    const expensesFormated = await this.ExpensesRepository.searchMany(
      organizationId,
      '',
      bankId,
      startMonth,
      endMonth,
    )
    const currentGain = await this.GainsRepository.searchMany(
      organizationId,
      '',
      bankId,
      startMonth,
      endMonth,
    )
    const currentCredit = await this.CreditRepository.searchMany(
      organizationId,
      '',
      bankId,
      startMonth,
      endMonth,
    )

    // Helper function to generate 12 months sequence
    const generate12MonthsSequence = (startDate: Date) => {
      const months = []
      for (let i = 0; i < 12; i++) {
        months.push(format(addMonths(startDate, i), 'y/MM'))
      }
      return months
    }

    const twelveMonthsSequence = generate12MonthsSequence(new Date(startMonth))

    const filteredByMonthExpenses = expensesFormated
      .map((transaction) => {
        const month = format(new Date(transaction.expiration_date), 'y/MM')
        return {
          ...transaction,
          month,
        }
      })
      .reduce((acc, transaction) => {
        const month = transaction.month
        if (!acc[month]) {
          acc[month] = []
        }
        acc[month].push(transaction)
        return acc
      }, {} as Record<string, typeof expensesFormated>)

    const monthlyTotalsExpenses = Object.entries(
      filteredByMonthExpenses,
    ).reduce((acc, [month, transactions]) => {
      const total = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      )
      const paidTotal = transactions.reduce(
        (sum, transaction) =>
          transaction.paid ? sum + transaction.amount : sum,
        0,
      )

      acc.push({
        month,
        total,
        paidTotal,
        transactions,
      })
      return acc
    }, [] as Array<{ month: string; total: number; paidTotal: number; transactions: typeof expensesFormated }>)

    // Create exactly 12 months with zero values for missing months
    const monthsSequenceExpenses = twelveMonthsSequence.map((monthKey) => {
      const existingMonth = monthlyTotalsExpenses.find(
        (m) => m.month === monthKey,
      )

      return {
        month: monthKey,
        total: existingMonth?.total ?? 0,
        paidTotal: existingMonth?.paidTotal ?? 0,
        transactions: existingMonth?.transactions ?? [],
      }
    })

    const filteredByMonthGains = currentGain
      .map((transaction) => {
        const month = format(new Date(transaction.expiration_date), 'y/MM')
        return {
          ...transaction,
          month,
        }
      })
      .reduce((acc, transaction) => {
        const month = transaction.month
        if (!acc[month]) {
          acc[month] = []
        }
        acc[month].push(transaction)
        return acc
      }, {} as Record<string, typeof currentGain>)

    const monthlyTotalsGains = Object.entries(filteredByMonthGains).reduce(
      (acc, [month, transactions]) => {
        const total = transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        )
        const paidTotal = transactions.reduce(
          (sum, transaction) =>
            transaction.paid ? sum + transaction.amount : sum,
          0,
        )

        acc.push({
          month,
          total,
          paidTotal,
          transactions,
        })
        return acc
      },
      [] as Array<{
        month: string
        total: number
        paidTotal: number
        transactions: typeof currentGain
      }>,
    )

    // Create exactly 12 months with zero values for missing months
    const monthsSequenceGains = twelveMonthsSequence.map((monthKey) => {
      const existingMonth = monthlyTotalsGains.find((m) => m.month === monthKey)

      return {
        month: monthKey,
        total: existingMonth?.total ?? 0,
        paidTotal: existingMonth?.paidTotal ?? 0,
        transactions: existingMonth?.transactions ?? [],
      }
    })

    const filteredByMonthAndBankCredits = currentCredit
      .map((transaction) => {
        const month = format(new Date(transaction.expiration_date), 'y/MM')
        const bankName = transaction.bank?.name || 'Cadastro manual'
        return {
          ...transaction,
          month,
          bankName,
        }
      })
      .reduce((acc, transaction) => {
        const month = transaction.month
        const bankName = transaction.bankName

        if (!acc[month]) {
          acc[month] = {}
        }
        if (!acc[month][bankName]) {
          acc[month][bankName] = []
        }
        acc[month][bankName].push(transaction)
        return acc
      }, {} as Record<string, Record<string, CreditWithBank[]>>)

    const monthlyTotalsCredits = Object.entries(
      filteredByMonthAndBankCredits,
    ).reduce(
      (acc, [month, banks]) => {
        const monthBanks = Object.entries(banks).map(
          ([bankName, transactions]) => {
            const total = transactions.reduce(
              (sum, transaction) => sum + transaction.amount,
              0,
            )
            const paidTotal = transactions.reduce(
              (sum, transaction) =>
                transaction.paid ? sum + transaction.amount : sum,
              0,
            )

            return {
              bankName,
              total,
              paidTotal,
              transactions,
            }
          },
        )

        acc.push({
          month,
          banks: monthBanks,
        })
        return acc
      },
      [] as Array<{
        month: string
        banks: Array<{
          bankName: string
          total: number
          paidTotal: number
          transactions: CreditWithBank[]
        }>
      }>,
    )

    // Create exactly 12 months with zero values for missing months
    const monthsSequenceCredits = twelveMonthsSequence.map((monthKey) => {
      const existingMonth = monthlyTotalsCredits.find(
        (m) => m.month === monthKey,
      )

      return {
        month: monthKey,
        banks: existingMonth?.banks ?? [],
      }
    })

    return {
      expenses: monthsSequenceExpenses,
      gains: monthsSequenceGains,
      credits: monthsSequenceCredits,
    }
  }
}
