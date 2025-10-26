import { addMonths, format, subMonths } from 'date-fns'

import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { BanksTypeAccountRepository } from '@/repositories/bank-repository'

interface SearchCreditsProjectionUseCaseRequest {
  organizationId: string
  date: string
  bankId?: string
  isSamePersonTransfer?: boolean
}

export class SearchCreditsProjectionUseCase {
  constructor(
    private CreditsProjectionRepository: CreditsProjectionRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    date,
    bankId,
    isSamePersonTransfer = false,
  }: SearchCreditsProjectionUseCaseRequest): Promise<object> {
    let totalCredits = 0
    let receivedCredits = 0

    let previousMonthTotalCredits = 0
    let previousMonthReceivedCredits = 0

    let nextMonthReceivedCredits = 0
    let nextMonthTotalCredits = 0

    const previousMonth = format(subMonths(new Date(date), 1), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 1), 'y/MM')

    const creditsFormated = await this.CreditsProjectionRepository.searchMany(
      organizationId,
      date,
      bankId,
    )
    const previousCredit = await this.CreditsProjectionRepository.searchMany(
      organizationId,
      previousMonth,
      bankId,
    )
    const nextCredit = await this.CreditsProjectionRepository.searchMany(
      organizationId,
      nextMonth,
      bankId,
    )

    previousCredit.map(({ amount, paid }) => {
      previousMonthTotalCredits += amount
      if (paid) previousMonthReceivedCredits += amount
      return true
    })
    nextCredit.map(({ amount, paid }) => {
      nextMonthTotalCredits += amount
      if (paid) nextMonthReceivedCredits += amount
      return true
    })

    creditsFormated.map(({ amount, paid }) => {
      totalCredits += amount
      if (paid) receivedCredits += amount
      return true
    })

    const banks = await this.BankTypeAccountRepository.findByOrganizationId(
      organizationId,
    )

    const totalBalance = banks.reduce((sum: number, bank: any) => {
      return sum + (bank.balance || 0)
    }, 0)

    const totalBalanceFormatted = (totalBalance / 100).toFixed(2)

    const totalCreditsFormatted = (totalCredits / 100).toFixed(2)
    const receivedCreditsFormatted = (receivedCredits / 100).toFixed(2)

    const previousMonthTotalCreditsFormatted = (
      previousMonthTotalCredits / 100
    ).toFixed(2)
    const previousMonthReceivedCreditsFormatted = (
      previousMonthReceivedCredits / 100
    ).toFixed(2)

    const nextMonthTotalCreditsFormatted = (
      nextMonthTotalCredits / 100
    ).toFixed(2)
    const nextMonthReceivedCreditsFormatted = (
      nextMonthReceivedCredits / 100
    ).toFixed(2)

    return {
      credits: creditsFormated,
      banks,
      totalBalance: totalBalanceFormatted,
      totalCredits: totalCreditsFormatted,
      receivedCredits: receivedCreditsFormatted,
      previousMonthTotalCredits: previousMonthTotalCreditsFormatted,
      previousMonthReceivedCredits: previousMonthReceivedCreditsFormatted,
      nextMonthTotalCredits: nextMonthTotalCreditsFormatted,
      nextMonthReceivedCredits: nextMonthReceivedCreditsFormatted,
    }
  }
}
