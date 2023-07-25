import { GainsRepository } from '@/repositories/gain-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { addMonths, format, subMonths } from 'date-fns'

interface SearchExpensesUseCaseRequest {
  organizationId: string
  date: string
}

export class SearchExpenseUseCase {
  constructor(
    private ExpensesRepository: ExpensesRepository,
    private GainsRepository: GainsRepository,
  ) {}

  async execute({
    organizationId,
    date,
  }: SearchExpensesUseCaseRequest): Promise<object> {
    let totalGains = 0
    let receivedGains = 0

    let totalExpenses = 0
    let receivedExpenses = 0

    let previousMonthTotalExpenses = 0
    let previousMonthReceivedExpenses = 0
    let previousMonthTotalGains = 0
    let previousMonthReceivedGains = 0

    let nextMonthReceivedGains = 0
    let nextMonthTotalGains = 0
    let nextMonthReceivedExpenses = 0
    let nextMonthTotalExpenses = 0

    const currentMonth = format(new Date(date), 'y/MM')
    const previousMonth = format(subMonths(new Date(date), 1), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 1), 'y/MM')

    const expensesFormated = await this.ExpensesRepository.searchMany(
      organizationId,
      date,
    )
    const currentGain = await this.GainsRepository.searchMany(
      organizationId,
      date,
    )
    const previousExpense = await this.ExpensesRepository.searchMany(
      organizationId,
      previousMonth,
    )
    const nextExpense = await this.ExpensesRepository.searchMany(
      organizationId,
      nextMonth,
    )
    const previousGain = await this.GainsRepository.searchMany(
      organizationId,
      previousMonth,
    )
    const nextGain = await this.GainsRepository.searchMany(
      organizationId,
      nextMonth,
    )

    previousExpense.map(({ amount, paid }) => {
      previousMonthTotalExpenses += amount
      if (paid) previousMonthReceivedExpenses += amount
      return true
    })
    nextExpense.map(({ amount, paid }) => {
      nextMonthTotalExpenses += amount
      if (paid) nextMonthReceivedExpenses += amount
      return true
    })

    previousGain.map(({ amount, paid }) => {
      previousMonthTotalGains += amount
      if (paid) previousMonthReceivedGains += amount
      return true
    })
    nextGain.map(({ amount, paid }) => {
      nextMonthTotalGains += amount
      if (paid) nextMonthReceivedGains += amount
      return true
    })

    currentGain.map(({ amount, paid }) => {
      totalGains += amount
      if (paid) receivedGains += amount
      return true
    })

    const expenses = expensesFormated.map(
      ({
        id,
        expiration_date,
        purchase_date,
        balance_close_date,
        description,
        category,
        company,
        amount,
        type_payment,
        installment_current,
        installment_total_payment,
        group_installment_id,
        paid,
      }) => {
        totalExpenses += amount
        if (paid) receivedExpenses += amount
        return {
          id,
          expirationDate: expiration_date,
          purchaseDate: purchase_date,
          balanceCloseDate: balance_close_date,
          description,
          company,
          category,
          amount,
          typePayment: type_payment,
          installmentCurrent: installment_current,
          installmentTotalPayment: installment_total_payment,
          groupInstallmentId: group_installment_id,
          paid,
        }
      },
    )

    return {
      result: [...expenses],
      previousMonth: {
        label: previousMonth,
        receivedGains: previousMonthReceivedGains,
        totalGains: previousMonthTotalGains,
        receivedExpenses: previousMonthReceivedExpenses,
        totalExpenses: previousMonthTotalExpenses,
      },
      currentMonth: {
        label: currentMonth,
        receivedGains,
        totalGains,
        receivedExpenses,
        totalExpenses,
      },
      nextMonth: {
        label: nextMonth,
        receivedGains: nextMonthReceivedGains,
        totalGains: nextMonthTotalGains,
        receivedExpenses: nextMonthReceivedExpenses,
        totalExpenses: nextMonthTotalExpenses,
      },
    }
  }
}
