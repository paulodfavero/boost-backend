import { BillsRepository } from '@/repositories/bills-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { normalizeCategory } from '@/lib/category-translation'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { DuplicateBillTransactionError } from './errors/duplicate-bill-transaction-error'
import { Prisma } from '@prisma/client'

interface CreateBillRequest {
  description: string
  company?: string | null
  category?: string | null
  amount: number
  expirationDate: string | Date
  dayOfMonth: number
  sourceTransactionId?: string | null
  organizationId: string
}

export class CreateBillUseCase {
  constructor(
    private billsRepository: BillsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreateBillRequest) {
    const {
      description,
      company,
      category,
      amount,
      expirationDate,
      dayOfMonth,
      sourceTransactionId,
      organizationId,
    } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    // Validar se já existe um bill com o mesmo source_transaction_id
    if (sourceTransactionId) {
      const existingBill =
        await this.billsRepository.findBySourceTransactionId(
          sourceTransactionId,
          organizationId,
        )
      if (existingBill) {
        throw new DuplicateBillTransactionError()
      }
    }

    const normalizedCategory = normalizeCategory(category || '')
    const startDate = new Date(expirationDate)

    // Ajustar o dia do mês
    const lastDayOfMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    ).getDate()
    const adjustedDay = Math.min(dayOfMonth, lastDayOfMonth)

    const expiration_date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      adjustedDay,
    )

    // Criar apenas UMA conta (a primeira)
    // O generate-monthly será responsável por gerar as próximas mensalmente
    // TODO: Remover workaround após aplicar migration 20251123160647_company_not_required
    // Por enquanto, passamos string vazia quando company é undefined/null
    // porque o banco ainda tem constraint NOT NULL até a migration ser aplicada
    const billData: Prisma.BillCreateInput = {
      description,
      category: normalizedCategory,
      amount,
      expiration_date,
      day_of_month: dayOfMonth,
      paid: false,
      active: true,
      source_transaction_id: sourceTransactionId || null,
      company: company ?? '',
      organization: {
        connect: {
          id: organizationId,
        },
      },
    }

    const bill = await this.billsRepository.create(billData)

    return bill
  }
}
