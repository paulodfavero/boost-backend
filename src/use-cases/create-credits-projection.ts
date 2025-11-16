import { addMonths, format } from 'date-fns'

import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { normalizeCategory } from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'

type MerchantType = {
  businessName?: string | null | undefined
  cnae?: string | null | undefined
  name?: string | null | undefined
  cnpj?: string | null | undefined
}
interface CreditProjectionRepository {
  expirationDate: string | Date
  purchaseDate?: string | Date | null
  balanceCloseDate?: string | Date | null
  bankTransactionId?: string | null
  description: string
  company: string
  category?: string | null
  amount: number
  typePayment: string
  operationType?: string | null
  paymentData?: string | null
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid: boolean
  merchant?: MerchantType | null
  bankId?: string | null
  bankTypeAccountId?: string | null
}

interface CreditProjectionType {
  organizationId: string
  reqBody: CreditProjectionRepository[]
}

export class CreateCreditsProjectionUseCase {
  constructor(
    private creditsProjectionRepository: CreditsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditProjectionType): Promise<object> {
    let dataReturn: any = []
    const { organizationId, reqBody: transactions } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    // Create a map to group recurrent transactions by description + category
    // Use group_installment_id for recurrent items
    const recurrentGroupsMap = new Map<string, string>()

    // First pass: identify recurrent groups and generate IDs
    transactions.forEach((transaction: CreditProjectionRepository) => {
      if (transaction.typePayment === 'recurrent') {
        const normalizedCategory = normalizeCategory(transaction.category)
        const groupKey = `${transaction.description}|${normalizedCategory}`

        if (!recurrentGroupsMap.has(groupKey)) {
          recurrentGroupsMap.set(
            groupKey,
            Math.floor(Date.now() * Math.random()).toString(12),
          )
        }
      }
    })

    transactions.map((transaction: CreditProjectionRepository) => {
      const {
        bankTransactionId,
        description,
        category,
        amount,
        paid,
        expirationDate,
        purchaseDate,
        balanceCloseDate,
        company,
        typePayment,
        operationType,
        paymentData,
        installmentCurrent,
        installmentTotalPayment,
        bankTypeAccountId,
        // merchant,
        bankId,
      } = transaction

      // Normalize category to ensure it's never null or empty
      const normalizedCategory = normalizeCategory(category)

      const expiration_date = format(new Date(expirationDate), 'y/MM/dd')
      const type_payment = typePayment
      const installment_current = installmentCurrent || null
      const installment_total_payment = installmentTotalPayment
      const isRecurrent = type_payment === 'recurrent'

      // Get group_installment_id from map if recurrent, otherwise generate new one for installments
      const groupInstallmentIdForRecurrent = isRecurrent
        ? recurrentGroupsMap.get(`${description}|${normalizedCategory}`) || null
        : null

      if (bankTransactionId || !installment_total_payment) {
        const companyName = transaction.company
        const splitCompanyName = companyName.split(' -')
        const companyTransaction = splitCompanyName[0]

        return (dataReturn = [
          ...dataReturn,
          {
            bank_transaction_id: bankTransactionId,
            expiration_date: expirationDate,
            purchase_date: purchaseDate,
            balance_close_date: balanceCloseDate,
            company: companyTransaction || company,
            type_payment,
            operation_type: operationType,
            payment_data: paymentData,
            installment_current,
            installment_total_payment,
            group_installment_id: groupInstallmentIdForRecurrent,
            organizationId,
            bankTypeAccountId,
            description,
            category: normalizedCategory,
            amount,
            paid,
            bankId,
          },
        ])
      }
      // For installments, use recurrent group ID if exists, otherwise generate new one
      const groupInstallmentId =
        groupInstallmentIdForRecurrent ||
        Math.floor(Date.now() * Math.random()).toString(12)
      for (let index = 0; index < installmentTotalPayment; index++) {
        const newExpirationDate = addMonths(new Date(expiration_date), index)
        const paidCurrent = index === 0 ? paid : false
        const isInstallment = type_payment === 'installment'

        const amountWithoutDots = amount / 100
        const amountPerMonth = (amountWithoutDots / installment_total_payment)
          .toFixed(2)
          .replace('.', '')

        const amountInstallment = Number(isInstallment ? amountPerMonth : null)

        dataReturn = [
          ...dataReturn,
          {
            bank_transaction_id: bankTransactionId,
            description,
            category: normalizedCategory,
            amount: amountInstallment || amount,
            paid: paidCurrent,
            expiration_date: newExpirationDate,
            purchase_date: purchaseDate,
            balance_close_date: balanceCloseDate,
            company,
            type_payment,
            operation_type: operationType,
            payment_data: paymentData,
            installment_current: index + 1,
            installment_total_payment,
            group_installment_id: groupInstallmentId,
            bankTypeAccountId,
            organizationId,
            bankId,
          },
        ]
      }
      return dataReturn
    })

    await this.creditsProjectionRepository.createMany(dataReturn)
    return transactions
  }
}
