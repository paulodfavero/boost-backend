import { CreditsRepository } from '@/repositories/credit-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { addMonths, format, subMonths } from 'date-fns'
import {
  BanksRepository,
  BanksTypeAccountRepository,
} from '@/repositories/bank-repository'

interface SearchCreditsUseCaseRequest {
  organizationId: string
  date: string
  bankId?: string
}

export class SearchCreditUseCase {
  constructor(
    private CreditsRepository: CreditsRepository,
    private ExpensesRepository: ExpensesRepository,
    private BankRepository: BanksRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    date,
    bankId,
  }: SearchCreditsUseCaseRequest): Promise<object> {
    let totalCredits = 0
    let receivedCredits = 0

    let totalExpenses = 0
    let receivedExpenses = 0

    let previousMonthTotalExpenses = 0
    let previousMonthReceivedExpenses = 0
    let previousMonthTotalCredits = 0
    let previousMonthReceivedCredits = 0

    let nextMonthReceivedCredits = 0
    let nextMonthTotalCredits = 0
    let nextMonthReceivedExpenses = 0
    let nextMonthTotalExpenses = 0

    const currentMonth = format(new Date(date), 'y/MM')
    const previousMonth = format(subMonths(new Date(date), 1), 'y/MM')
    const nextMonth = format(addMonths(new Date(date), 1), 'y/MM')

    const creditsFormated = await this.CreditsRepository.searchMany(
      organizationId,
      date,
      bankId,
    )
    const currentExpense = await this.ExpensesRepository.searchMany(
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
    const previousCredit = await this.CreditsRepository.searchMany(
      organizationId,
      previousMonth,
      bankId,
    )
    const nextCredit = await this.CreditsRepository.searchMany(
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

    currentExpense.map(({ amount, paid }) => {
      totalExpenses += amount
      if (paid) receivedExpenses += amount
      return true
    })

    const credits = await Promise.all(
      creditsFormated.map(
        async ({
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
          bankId,
          bankTypeAccountId,
        }) => {
          totalCredits += amount
          if (paid) receivedCredits += amount

          const bankTypeAccount = bankTypeAccountId
            ? await this.BankTypeAccountRepository.findById(bankTypeAccountId)
            : null

          const bank = bankId
            ? await this.BankRepository.findById(bankId)
            : null

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
            bank,
            bankTypeAccount,
          }
        },
      ),
    )

    return {
      result: [...credits],
      previousMonth: {
        label: previousMonth,
        receivedCredits: previousMonthReceivedCredits,
        totalCredits: previousMonthTotalCredits,
        receivedExpenses: previousMonthReceivedExpenses,
        totalExpenses: previousMonthTotalExpenses,
      },
      currentMonth: {
        label: currentMonth,
        receivedCredits,
        totalCredits,
        receivedExpenses,
        totalExpenses,
      },
      nextMonth: {
        label: nextMonth,
        receivedCredits: nextMonthReceivedCredits,
        totalCredits: nextMonthTotalCredits,
        receivedExpenses: nextMonthReceivedExpenses,
        totalExpenses: nextMonthTotalExpenses,
      },
    }
  }
}
export class SearchCreditCardListUseCase {
  constructor(private BankTypeAccountRepository: BanksTypeAccountRepository) {}

  async execute({
    organizationId,
  }: SearchCreditsUseCaseRequest): Promise<object> {
    const creditsFormated =
      (await this.BankTypeAccountRepository.findByOrganizationId(
        organizationId,
      )) as any[]
    const creditCardList = creditsFormated.filter(
      (card: any) => card.type === 'CREDIT',
    )
    return creditCardList
  }
}
