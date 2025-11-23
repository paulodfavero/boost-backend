import { addMonths, startOfMonth } from 'date-fns'
import { BillsRepository } from '@/repositories/bills-repository'

interface GenerateMonthlyBillsRequest {
  organizationId: string
  targetMonth?: string // Formato: 'YYYY-MM' (opcional, padrão: próximo mês)
}

export class GenerateMonthlyBillsUseCase {
  constructor(private billsRepository: BillsRepository) {}

  async execute(data: GenerateMonthlyBillsRequest) {
    const { organizationId, targetMonth } = data

    // Buscar todas as contas ativas
    const activeBills = await this.billsRepository.findActiveBills(
      organizationId,
    )

    // Determinar o mês alvo
    let targetDate: Date
    if (targetMonth) {
      const [year, month] = targetMonth.split('-').map(Number)
      targetDate = new Date(year, month - 1, 1)
    } else {
      // Próximo mês
      targetDate = startOfMonth(addMonths(new Date(), 1))
    }

    const generatedBills = []

    for (const bill of activeBills) {
      // Verificar se já existe uma conta para este mês
      const existingBills = await this.billsRepository.searchMany(
        organizationId,
        String(targetDate.getMonth() + 1).padStart(2, '0'),
        String(targetDate.getFullYear()),
      )

      // Verificar se já existe uma conta com a mesma descrição e empresa para este mês
      const alreadyExists = existingBills.some(
        (b) =>
          b.description === bill.description &&
          (b.company || null) === (bill.company || null) &&
          b.day_of_month === bill.day_of_month,
      )

      if (!alreadyExists) {
        // Calcular o último dia do mês
        const lastDayOfMonth = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth() + 1,
          0,
        ).getDate()

        // Ajustar o dia do mês
        const adjustedDay = Math.min(bill.day_of_month, lastDayOfMonth)

        const expiration_date = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          adjustedDay,
        )

        // TODO: Remover workaround após aplicar migration 20251123160647_company_not_required
        // Por enquanto, passamos string vazia quando company é null/undefined
        // porque o banco ainda tem constraint NOT NULL até a migration ser aplicada
        const newBill = await this.billsRepository.create({
          description: bill.description,
          company: bill.company ?? '',
          category: bill.category,
          amount: bill.amount,
          expiration_date,
          day_of_month: bill.day_of_month,
          paid: false,
          active: bill.active,
          source_transaction_id: bill.source_transaction_id,
          organization: {
            connect: {
              id: organizationId,
            },
          },
        })

        generatedBills.push(newBill)
      }
    }

    return generatedBills
  }
}
