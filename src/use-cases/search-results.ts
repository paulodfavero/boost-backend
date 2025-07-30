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
    const previousMonth = format(subMonths(new Date(date), 6), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 6), 'y/MM')

    const expensesFormated = await this.ExpensesRepository.searchMany(
      organizationId,
      '',
      bankId,
      previousMonth,
      nextMonth,
    )
    const currentGain = await this.GainsRepository.searchMany(
      organizationId,
      '',
      bankId,
      previousMonth,
      nextMonth,
    )
    const currentCredit = await this.CreditRepository.searchMany(
      organizationId,
      '',
      bankId,
      previousMonth,
      nextMonth,
    )

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

    // Create a sequence of months between previousMonth and nextMonth
    const monthsSequenceExpenses = []
    const processedMonths = new Set<string>()
    let currentDate = new Date(previousMonth)
    const endDate = new Date(nextMonth)

    while (currentDate <= endDate) {
      const monthKey = format(currentDate, 'y/MM')

      if (!processedMonths.has(monthKey)) {
        const existingMonth = monthlyTotalsExpenses.find(
          (m) => m.month === monthKey,
        )

        monthsSequenceExpenses.push({
          month: monthKey,
          total: existingMonth?.total ?? 0,
          paidTotal: existingMonth?.paidTotal ?? 0,
          transactions: existingMonth?.transactions ?? [],
        })

        processedMonths.add(monthKey)
      }
      currentDate = addMonths(currentDate, 1)
    }

    const sortedMonthsExpenses = monthsSequenceExpenses.sort((a, b) => {
      const [yearA, monthA] = a.month.split('/')
      const [yearB, monthB] = b.month.split('/')
      return yearA.localeCompare(yearB) || monthA.localeCompare(monthB)
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

    // Create a sequence of months between previousMonth and nextMonth
    const monthsSequenceGains = []
    const processedMonthsGains = new Set<string>()
    let currentDateGains = new Date(previousMonth)
    const endDateGains = new Date(nextMonth)

    while (currentDateGains <= endDateGains) {
      const monthKey = format(currentDateGains, 'y/MM')

      if (!processedMonthsGains.has(monthKey)) {
        const existingMonth = monthlyTotalsGains.find(
          (m) => m.month === monthKey,
        )

        monthsSequenceGains.push({
          month: monthKey,
          total: existingMonth?.total ?? 0,
          paidTotal: existingMonth?.paidTotal ?? 0,
          transactions: existingMonth?.transactions ?? [],
        })

        processedMonthsGains.add(monthKey)
      }
      currentDateGains = addMonths(currentDateGains, 1)
    }

    const sortedMonthsGains = monthsSequenceGains.sort((a, b) => {
      const [yearA, monthA] = a.month.split('/')
      const [yearB, monthB] = b.month.split('/')
      return yearA.localeCompare(yearB) || monthA.localeCompare(monthB)
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

    const sortedMonthsCredits = monthlyTotalsCredits.sort((a, b) => {
      const [yearA, monthA] = a.month.split('/')
      const [yearB, monthB] = b.month.split('/')
      return yearA.localeCompare(yearB) || monthA.localeCompare(monthB)
    })
    return {
      expenses: sortedMonthsExpenses,
      gains: sortedMonthsGains,
      credits: sortedMonthsCredits,
    }
  }
}
