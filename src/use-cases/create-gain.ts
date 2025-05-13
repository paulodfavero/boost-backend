import { addMonths, format } from 'date-fns'

import { GainsRepository } from '@/repositories/gain-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainRepository {
  expirationDate: string | Date
  description: string
  company: string
  category: string
  amount: number
  typePayment: string
  installmentTotalPayment?: number | null
  paid: boolean
}

interface GainType {
  organizationId: string
  reqBody: GainRepository[]
}

export class CreateGainUseCase {
  constructor(
    private gainsRepository: GainsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: GainType): Promise<object> {
    let dataReturn: any = []
    const { organizationId, reqBody: transactions } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    transactions.map((transaction: GainRepository) => {
      const {
        description,
        category,
        amount,
        paid,
        expirationDate,
        company,
        typePayment,
        installmentTotalPayment,
      } = transaction

      const expiration_date = format(new Date(expirationDate), 'y/MM/dd')
      const type_payment = typePayment
      const installment_total_payment = installmentTotalPayment

      if (!installment_total_payment) {
        return (dataReturn = [
          ...dataReturn,
          {
            expiration_date: expirationDate,
            company,
            type_payment,
            installment_total_payment,
            organizationId,
            description,
            category,
            amount,
            paid,
          },
        ])
      }
      for (let index = 0; index < installmentTotalPayment; index++) {
        const newExpirationDate = addMonths(new Date(expiration_date), index)
        const paidCurrent = index === 0 ? paid : false
        const isInstallment = type_payment === 'installment'

        const amountWithoutDots = amount / 100
        const amountPerMonth = (amountWithoutDots / installment_total_payment)
          .toFixed(2)
          .replace('.', '')

        const amountInstallment = isInstallment ? amountPerMonth : null
        dataReturn = [
          ...dataReturn,
          {
            description,
            category,
            amount: Number(amountInstallment) || amount,
            paid: paidCurrent,
            installment_current: index + 1,
            expiration_date: newExpirationDate,
            company,
            type_payment,
            installment_total_payment,
            organizationId,
          },
        ]
      }
      return dataReturn
    })

    await this.gainsRepository.createMany(dataReturn)
    return transactions
  }
}
