import { BillsRepository } from '@/repositories/bills-repository'

interface SearchBillsRequest {
  organizationId: string
  month?: string
  year?: string
  paid?: boolean
}

export class SearchBillsUseCase {
  constructor(private billsRepository: BillsRepository) {}

  async execute(data: SearchBillsRequest) {
    const { organizationId, month, year, paid } = data

    const bills = await this.billsRepository.searchMany(
      organizationId,
      month,
      year,
      paid,
    )

    return bills
  }
}
