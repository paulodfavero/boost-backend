import { addMonths, format, subMonths } from 'date-fns'

import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { BanksTypeAccountRepository } from '@/repositories/bank-repository'

interface SearchGainsProjectionUseCaseRequest {
  organizationId: string
  date: string
  bankId?: string
  isSamePersonTransfer?: boolean
}

export class SearchGainsProjectionUseCase {
  constructor(
    private ExpensesProjectionRepository: ExpensesProjectionRepository,
    private GainsProjectionRepository: GainsProjectionRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    date,
    bankId,
    isSamePersonTransfer = false,
  }: SearchGainsProjectionUseCaseRequest): Promise<object> {
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

    const previousMonth = format(subMonths(new Date(date), 1), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 1), 'y/MM')

    const gainsFormated = await this.GainsProjectionRepository.searchMany(
      organizationId,
      date,
      bankId,
    )
    const currentExpense = await this.ExpensesProjectionRepository.searchMany(
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
    const previousGain = await this.GainsProjectionRepository.searchMany(
      organizationId,
      previousMonth,
      bankId,
    )
    const nextGain = await this.GainsProjectionRepository.searchMany(
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

    gainsFormated.map(({ amount, paid }) => {
      totalGains += amount
      if (paid) receivedGains += amount
      return true
    })

    currentExpense.map(({ amount, paid }) => {
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
    const totalGainsFormatted = (totalGains / 100).toFixed(2)
    const receivedGainsFormatted = (receivedGains / 100).toFixed(2)

    const previousMonthTotalExpensesFormatted = (
      previousMonthTotalExpenses / 100
    ).toFixed(2)
    const previousMonthReceivedExpensesFormatted = (
      previousMonthReceivedExpenses / 100
    ).toFixed(2)
    const previousMonthTotalGainsFormatted = (
      previousMonthTotalGains / 100
    ).toFixed(2)
    const previousMonthReceivedGainsFormatted = (
      previousMonthReceivedGains / 100
    ).toFixed(2)

    const nextMonthTotalExpensesFormatted = (
      nextMonthTotalExpenses / 100
    ).toFixed(2)
    const nextMonthReceivedExpensesFormatted = (
      nextMonthReceivedExpenses / 100
    ).toFixed(2)
    const nextMonthTotalGainsFormatted = (nextMonthTotalGains / 100).toFixed(2)
    const nextMonthReceivedGainsFormatted = (
      nextMonthReceivedGains / 100
    ).toFixed(2)

    return {
      gains: gainsFormated,
      expenses: currentExpense,
      banks,
      totalBalance: totalBalanceFormatted,
      totalExpenses: totalExpensesFormatted,
      receivedExpenses: receivedExpensesFormatted,
      totalGains: totalGainsFormatted,
      receivedGains: receivedGainsFormatted,
      previousMonthTotalExpenses: previousMonthTotalExpensesFormatted,
      previousMonthReceivedExpenses: previousMonthReceivedExpensesFormatted,
      previousMonthTotalGains: previousMonthTotalGainsFormatted,
      previousMonthReceivedGains: previousMonthReceivedGainsFormatted,
      nextMonthTotalExpenses: nextMonthTotalExpensesFormatted,
      nextMonthReceivedExpenses: nextMonthReceivedExpensesFormatted,
      nextMonthTotalGains: nextMonthTotalGainsFormatted,
      nextMonthReceivedGains: nextMonthReceivedGainsFormatted,
    }
  }
}
