import { addMonths, format } from 'date-fns'

import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

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
            category,
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
