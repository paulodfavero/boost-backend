import { GainsRepository } from '@/repositories/gain-repository'
import { format, subMonths } from 'date-fns'
import {
  BanksRepository,
  BanksTypeAccountRepository,
} from '@/repositories/bank-repository'

// Helper function to check if a category is "Transferência mesma titularidade"
const isSamePersonTransferCategory = (categoryName: string): boolean => {
  return categoryName.includes('Transferência mesma titularidade')
}

interface SearchRecurrentGainsUseCaseRequest {
  organizationId: string
  bankId?: string
  isSamePersonTransfer?: boolean
}

interface RecurrentTransaction {
  id: string
  expirationDate: Date | string | null
  purchaseDate: Date | string | null
  balanceCloseDate: Date | string | null
  description: string
  company: string
  category: string | null
  amount: number
  typePayment: string
  installmentCurrent: number | null
  installmentTotalPayment: number | null
  groupInstallmentId: string | null
  paid: boolean
  bank: any
  bankTypeAccount: any
  recurrenceCount: number
  months: string[]
}

export class SearchRecurrentGainsUseCase {
  constructor(
    private GainsRepository: GainsRepository,
    private BankRepository: BanksRepository,
    private BankTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({
    organizationId,
    bankId,
    isSamePersonTransfer = false,
  }: SearchRecurrentGainsUseCaseRequest): Promise<object> {
    // Calculate 12 months period: 12 months before today
    const today = new Date()
    const startMonth = format(subMonths(today, 11), 'y/MM')
    const endMonth = format(today, 'y/MM')

    // Fetch all gains from the last 12 months
    const allGains = await this.GainsRepository.searchMany(
      organizationId,
      '',
      bankId,
      startMonth,
      endMonth,
    )

    // Filter gains based on isSamePersonTransfer parameter
    const filteredGains = allGains.filter((gain) => {
      if (isSamePersonTransfer) {
        return true
      } else {
        return !isSamePersonTransferCategory(gain.category || '')
      }
    })

    // Group gains by month and by description + category
    const transactionMap = new Map<
      string,
      {
        transactions: typeof filteredGains
        months: Set<string>
      }
    >()

    filteredGains.forEach((gain) => {
      const month = format(new Date(gain.expiration_date), 'y/MM')
      const key = `${gain.description || ''}|${gain.category || ''}`

      if (!transactionMap.has(key)) {
        transactionMap.set(key, {
          transactions: [],
          months: new Set(),
        })
      }

      const entry = transactionMap.get(key)!
      entry.transactions.push(gain)
      entry.months.add(month)
    })

    // Filter transactions that appear in multiple months and format them
    const recurrentTransactions: RecurrentTransaction[] = []

    for (const [, { transactions, months }] of transactionMap.entries()) {
      if (months.size > 1) {
        // Get the most recent transaction as representative
        const representative = transactions.sort(
          (a, b) =>
            new Date(b.expiration_date).getTime() -
            new Date(a.expiration_date).getTime(),
        )[0]

        const bankTypeAccount = representative.bankTypeAccountId
          ? await this.BankTypeAccountRepository.findById(
              representative.bankTypeAccountId,
            )
          : null

        const bank = representative.bankId
          ? await this.BankRepository.findById(representative.bankId)
          : null

        recurrentTransactions.push({
          id: representative.id,
          expirationDate: representative.expiration_date,
          purchaseDate: representative.purchase_date,
          balanceCloseDate: representative.balance_close_date,
          description: representative.description,
          company: representative.company,
          category: representative.category,
          amount: representative.amount,
          typePayment: representative.type_payment,
          installmentCurrent: representative.installment_current,
          installmentTotalPayment: representative.installment_total_payment,
          groupInstallmentId: representative.group_installment_id,
          paid: representative.paid,
          bank,
          bankTypeAccount,
          recurrenceCount: months.size,
          months: Array.from(months).sort(),
        })
      }
    }

    // Sort by recurrence count (descending) and then by description
    recurrentTransactions.sort((a, b) => {
      if (b.recurrenceCount !== a.recurrenceCount) {
        return b.recurrenceCount - a.recurrenceCount
      }
      return (a.description || '').localeCompare(b.description || '')
    })

    return {
      result: recurrentTransactions,
    }
  }
}
