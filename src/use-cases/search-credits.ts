import { CreditsRepository } from '@/repositories/credit-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import {
  addMonths,
  format,
  subMonths,
  getYear,
  getMonth,
  isWeekend,
  addDays,
  isBefore,
  isAfter,
  subDays,
} from 'date-fns'
import { isNationalHoliday } from 'date-fns-holiday-br'
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

  private getNextBusinessDay(date: Date): Date {
    let currentDate = new Date(date)

    while (isWeekend(currentDate) || isNationalHoliday(currentDate)) {
      currentDate = addDays(currentDate, 1)
    }

    return currentDate
  }

  private calculateBalanceDueDate(
    bankTypeAccount: any,
    currentDate: string,
  ): { balanceDueDate: string; balanceCloseDate: string } | null {
    if (!bankTypeAccount?.balance_due_date_week_day) {
      return null
    }

    const currentDateObj = new Date(currentDate)
    const year = getYear(currentDateObj)
    const currentMonth = getMonth(currentDateObj) + 1 // getMonth retorna 0-11, então adicionamos 1
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? year + 1 : year

    // Criar a data com o ano, mês atual + 1, e o dia da semana do balance_due_date_week_day
    const balanceDueDateRaw = new Date(
      nextYear,
      nextMonth - 1,
      parseInt(bankTypeAccount.balance_due_date_week_day),
    )

    // Criar a data com o ano, mês atual + 1, e o dia da semana do balance_close_date_week_day
    const balanceCloseDateRaw = new Date(
      nextYear,
      nextMonth - 1,
      parseInt(bankTypeAccount.balance_close_date_week_day),
    )

    // Ajustar apenas balanceDueDate para próximo dia útil se necessário
    const balanceDueDate = this.getNextBusinessDay(balanceDueDateRaw)
    const balanceCloseDate = balanceCloseDateRaw

    return {
      balanceDueDate: balanceDueDate?.toISOString(),
      balanceCloseDate: balanceCloseDate?.toISOString(),
    }
  }

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
      bankId,
    )
    const previousExpense = await this.ExpensesRepository.searchMany(
      organizationId,
      previousMonth,
      bankId,
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
    // console.log('nextCredit', nextCredit)
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
    // Map para armazenar os cálculos de balance por bankTypeAccountId
    const balanceAmountMap = new Map<
      string,
      {
        balanceAmount: number
        balanceDueDate: string | null
        balanceCloseDate: string | null
      }
    >()

    const credits = await Promise.all(
      creditsFormated.map(
        async ({
          id,
          expiration_date,
          purchase_date,
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

          const getBalances = this.calculateBalanceDueDate(
            bankTypeAccount,
            date,
          )

          // Aplicar a mesma lógica do balance: só retorna transações que estão na conta
          if (expiration_date && getBalances?.balanceCloseDate) {
            // Condição 1: isBefore - transação deve estar antes da data de fechamento
            const isBeforeCloseDate = isBefore(
              new Date(format(new Date(expiration_date), 'yyyy/MM/dd')),
              new Date(
                format(new Date(getBalances.balanceCloseDate), 'yyyy/MM/dd'),
              ),
            )

            // Condição 2: isAfter - transação deve estar após (data de fechamento - 1 mês - 1 dia)
            const isAfterCloseDateMinusMonthAndDay = isAfter(
              new Date(format(new Date(expiration_date), 'yyyy/MM/dd')),
              new Date(
                subMonths(
                  subDays(new Date(getBalances.balanceCloseDate), 1),
                  1,
                ),
              ),
            )

            // Se não atender a ambas as condições, não retorna a transação
            if (!(isBeforeCloseDate && isAfterCloseDateMinusMonthAndDay)) {
              return null
            }
          }
          // Só calcula o balance se ainda não foi calculado para este bankTypeAccountId
          if (!balanceAmountMap.has(bankTypeAccountId ?? '')) {
            const getNextCredit = nextCredit
              .filter(
                (credit) => credit.bankTypeAccountId === bankTypeAccountId,
              )
              .filter((credit) => {
                if (credit.expiration_date) {
                  console.log(
                    'credit.expiration_date',
                    new Date(credit.expiration_date),
                  )

                  return isBefore(
                    new Date(
                      format(new Date(credit.expiration_date), 'yyyy/MM/dd'),
                    ),
                    new Date(
                      format(
                        new Date(getBalances?.balanceCloseDate ?? ''),
                        'yyyy/MM/dd',
                      ),
                    ),
                  )
                }
                return false
              })
              .reduce((acc, credit) => {
                acc += credit.amount
                return acc
              }, 0)
            const getCurrentBalance = creditsFormated
              .filter(
                (credit) => credit.bankTypeAccountId === bankTypeAccountId,
              )
              .filter((credit) => {
                if (credit.expiration_date) {
                  // console.log(
                  //   'credit.expiration_date',
                  //   new Date(credit.expiration_date),
                  // )
                  return isAfter(
                    new Date(
                      format(new Date(credit.expiration_date), 'yyyy/MM/dd'),
                    ),
                    new Date(
                      subMonths(
                        subDays(
                          new Date(getBalances?.balanceCloseDate ?? ''),
                          1,
                        ),
                        1,
                      ),
                    ),
                  )
                }
                return false
              })
              .reduce((acc, credit) => {
                acc += credit.amount
                return acc
              }, 0)

            // Armazena o valor calculado no Map com as datas
            balanceAmountMap.set(bankTypeAccountId ?? '', {
              balanceAmount: getNextCredit + getCurrentBalance,
              balanceDueDate: getBalances?.balanceDueDate || null,
              balanceCloseDate: getBalances?.balanceCloseDate || null,
            })
          }

          // console.log('Balance Due Date Calculation:', {
          //   balanceDueDate: getBalances?.balanceDueDate,
          //   balanceCloseDate: getBalances?.balanceCloseDate,
          // })

          return {
            id,
            expirationDate: expiration_date,
            purchaseDate: purchase_date,
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
            bankName: (bank as any)?.name ?? null,
            bankTypeAccount,
          }
        },
      ),
    )

    // Converte o Map para array de objetos
    const balanceAmount = Array.from(balanceAmountMap.entries()).map(
      ([bankTypeAccountId, balanceData]) => ({
        bankTypeAccountId,
        balanceAmount: balanceData.balanceAmount,
        balanceDueDate: balanceData.balanceDueDate,
        balanceCloseDate: balanceData.balanceCloseDate,
      }),
    )

    // Format nextMonth credits similar to current month credits
    const nextMonthCredits = await Promise.all(
      nextCredit.map(
        async ({
          id,
          expiration_date,
          purchase_date,
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
          const bankTypeAccount = bankTypeAccountId
            ? await this.BankTypeAccountRepository.findById(bankTypeAccountId)
            : null

          const bank = bankId
            ? await this.BankRepository.findById(bankId)
            : null
          if (!(bank as any)?.name) return null

          const getBalances = this.calculateBalanceDueDate(
            bankTypeAccount,
            date,
          )

          // Aplicar a mesma lógica do balance: só retorna transações que estão na conta
          if (expiration_date && getBalances?.balanceCloseDate) {
            // Condição 1: isBefore - transação deve estar antes da data de fechamento
            const isBeforeCloseDate = isBefore(
              new Date(format(new Date(expiration_date), 'yyyy/MM/dd')),
              new Date(
                format(new Date(getBalances.balanceCloseDate), 'yyyy/MM/dd'),
              ),
            )

            // Condição 2: isAfter - transação deve estar após (data de fechamento - 1 mês - 1 dia)
            const isAfterCloseDateMinusMonthAndDay = isAfter(
              new Date(format(new Date(expiration_date), 'yyyy/MM/dd')),
              new Date(
                subMonths(
                  subDays(new Date(getBalances.balanceCloseDate), 1),
                  1,
                ),
              ),
            )

            // Se não atender a ambas as condições, não retorna a transação
            if (!(isBeforeCloseDate && isAfterCloseDateMinusMonthAndDay)) {
              return null
            }
          }
          return {
            id,
            expirationDate: expiration_date,
            purchaseDate: purchase_date,
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
            bankName: (bank as any)?.name ?? null,
            bankTypeAccount,
          }
        },
      ),
    )

    // Filtrar os null do array de créditos
    const filteredCredits = credits.filter((credit) => credit !== null)
    const filteredNextMonthCredits = nextMonthCredits.filter(
      (credit) => credit !== null,
    )

    return {
      balanceAmount,
      result: filteredCredits,
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
        credits: filteredNextMonthCredits,
      },
    }
  }
}

export class SearchCreditCardListUseCase {
  constructor(
    private BankTypeAccountRepository: BanksTypeAccountRepository,
    private BankRepository: BanksRepository,
  ) {}

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
    const creditCardListWithBankName = await Promise.all(
      creditCardList.map(async (card: any) => {
        const bank = card.bankId
          ? await this.BankRepository.findById(card.bankId)
          : null
        return {
          ...card,
          bankName: (bank as any)?.name ?? null,
        }
      }),
    )
    return creditCardListWithBankName
  }
}
