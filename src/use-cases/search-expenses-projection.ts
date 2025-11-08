import { addMonths, format, subMonths } from 'date-fns'

import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { BanksTypeAccountRepository } from '@/repositories/bank-repository'

interface SearchExpensesProjectionUseCaseRequest {
  organizationId: string
  date: string
  bankId?: string
  isSamePersonTransfer?: boolean
}

export class SearchExpensesProjectionUseCase {
  constructor(
    private ExpensesProjectionRepository: ExpensesProjectionRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    date,
    bankId,
    isSamePersonTransfer = false,
  }: SearchExpensesProjectionUseCaseRequest): Promise<object> {
    let totalExpenses = 0
    let receivedExpenses = 0

    let previousMonthTotalExpenses = 0
    let previousMonthReceivedExpenses = 0

    let nextMonthReceivedExpenses = 0
    let nextMonthTotalExpenses = 0

    const previousMonth = format(subMonths(new Date(date), 1), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 1), 'y/MM')

    const expensesFormated = await this.ExpensesProjectionRepository.searchMany(
      organizationId,
      date,
      bankId,
    )
    const previousExpense = await this.ExpensesProjectionRepository.searchMany(
      organizationId,
      previousMonth,
      bankId,
    )
    const nextExpense = await this.ExpensesProjectionRepository.searchMany(
      organizationId,
      nextMonth,
      bankId,
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

    expensesFormated.map(({ amount, paid }) => {
      totalExpenses += amount
      if (paid) receivedExpenses += amount
      return true
    })

    const banks = await this.BankTypeAccountRepository.findByOrganizationId(
      organizationId,
    )

    const totalBalance = banks.reduce((sum: number, bank: any) => {
      return sum + (bank.balance || 0)
    }, 0)

    const totalBalanceFormatted = (totalBalance / 100).toFixed(2)

    const totalExpensesFormatted = (totalExpenses / 100).toFixed(2)
    const receivedExpensesFormatted = (receivedExpenses / 100).toFixed(2)

    const previousMonthTotalExpensesFormatted = (
      previousMonthTotalExpenses / 100
    ).toFixed(2)
    const previousMonthReceivedExpensesFormatted = (
      previousMonthReceivedExpenses / 100
    ).toFixed(2)

    const nextMonthTotalExpensesFormatted = (
      nextMonthTotalExpenses / 100
    ).toFixed(2)
    const nextMonthReceivedExpensesFormatted = (
      nextMonthReceivedExpenses / 100
    ).toFixed(2)

    return {
      expenses: expensesFormated,
      banks,
      totalBalance: totalBalanceFormatted,
      totalExpenses: totalExpensesFormatted,
      receivedExpenses: receivedExpensesFormatted,
      previousMonthTotalExpenses: previousMonthTotalExpensesFormatted,
      previousMonthReceivedExpenses: previousMonthReceivedExpensesFormatted,
      nextMonthTotalExpenses: nextMonthTotalExpensesFormatted,
      nextMonthReceivedExpenses: nextMonthReceivedExpensesFormatted,
    }
  }
}
