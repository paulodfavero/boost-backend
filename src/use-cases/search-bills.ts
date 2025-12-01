import { BillsRepository } from '@/repositories/bills-repository'
import { GenerateMonthlyBillsUseCase } from './generate-monthly-bills'

interface SearchBillsRequest {
  organizationId: string
  month?: string
  year?: string
  paid?: boolean
}

export class SearchBillsUseCase {
  constructor(
    private billsRepository: BillsRepository,
    private generateMonthlyBillsUseCase: GenerateMonthlyBillsUseCase,
  ) {}

  async execute(data: SearchBillsRequest) {
    const { organizationId, month, year, paid } = data

    // Buscar bills normalmente
    let bills = await this.billsRepository.searchMany(
      organizationId,
      month,
      year,
      paid,
    )

    // Se month e year foram fornecidos e não há bills, gerar automaticamente
    // Não gerar se estiver buscando apenas contas pagas (paid=true)
    if (month && year && bills.length === 0 && paid !== true) {
      // Gerar bills para o mês solicitado
      const targetMonth = `${year}-${month.padStart(2, '0')}`
      await this.generateMonthlyBillsUseCase.execute({
        organizationId,
        targetMonth,
      })

      // Buscar novamente após gerar
      bills = await this.billsRepository.searchMany(
        organizationId,
        month,
        year,
        paid,
      )
    }

    return bills
  }
}
