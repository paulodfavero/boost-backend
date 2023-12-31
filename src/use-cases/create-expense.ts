import { addMonths, format } from 'date-fns'

import { ExpensesRepository } from '@/repositories/expense-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

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
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid: boolean
  merchant: MerchantType
  bankId?: string
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
        installmentCurrent,
        installmentTotalPayment,
        // merchant,
        bankId,
      } = transaction

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
            installment_current,
            installment_total_payment,
            organizationId,
            description,
            category,
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

        dataReturn = [
          ...dataReturn,
          {
            bank_transaction_id: bankTransactionId,
            description,
            category,
            amount,
            paid: paidCurrent,
            expiration_date: newExpirationDate,
            purchase_date: purchaseDate,
            balance_close_date: balanceCloseDate,
            company,
            type_payment,
            installment_current: index + 1,
            installment_total_payment,
            group_installment_id: groupInstallmentId,
            organizationId,
            bankId,
          },
        ]
      }

      return dataReturn
    })

    console.log(
      '%ccreate-expense.ts line:90 dataReturn',
      'color: #007acc;',
      dataReturn,
    )
    // return false
    const expense = await this.expensesRepository.createMany(dataReturn)
    return expense
  }
}
