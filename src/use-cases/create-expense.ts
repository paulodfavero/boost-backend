import { addMonths, format } from 'date-fns'

import { ExpensesRepository } from '@/repositories/expense-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  translateCategory,
  normalizeCategory,
} from '@/lib/category-translation'
import { applyCategoryRules } from '@/lib/category-rules'

import { OrganizationNotFound } from './errors/organization-not-found-error'

type MerchantType = {
  businessName?: string | undefined
  cnae?: string | undefined
  name?: string | undefined
  cnpj?: string | undefined
}
interface ExpenseRepository {
  expirationDate: string | Date
  purchaseDate: string | Date
  balanceCloseDate: string | Date
  bankTransactionId?: string | undefined
  description: string
  company: string
  category: string
  amount: number
  typePayment: string
  operationType?: string
  paymentData?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid: boolean
  merchant: MerchantType
  bankId?: string
  bankTypeAccountId?: string
}

interface ExpenseType {
  organizationId: string
  reqBody: ExpenseRepository[]
}

export class CreateExpenseUseCase {
  constructor(
    private expensesRepository: ExpensesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: ExpenseType): Promise<object> {
    let dataReturn: any = []
    const { organizationId, reqBody: transactions } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    transactions.map((transaction: ExpenseRepository) => {
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

      // Apply domain rules to adjust category based on description
      const adjustedCategory = applyCategoryRules(description, category)

      // Translate category from English to Portuguese
      const translatedCategory = translateCategory(adjustedCategory)

      // Normalize category to ensure it's never null or empty
      const normalizedCategory = normalizeCategory(translatedCategory)

      const expiration_date = format(new Date(expirationDate), 'y/MM/dd')
      const type_payment = typePayment
      const installment_current = installmentCurrent || null
      const installment_total_payment = installmentTotalPayment

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
      const groupInstallmentId = Math.floor(
        Date.now() * Math.random(),
      ).toString(12)

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

    // return false
    const expense = await this.expensesRepository.createMany(dataReturn)
    return expense
  }
}
