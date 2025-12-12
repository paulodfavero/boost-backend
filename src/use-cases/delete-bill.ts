import { BillsRepository } from '@/repositories/bills-repository'
import { BillNotFoundError } from './errors/bill-not-found-error'

interface DeleteBillRequest {
  billId: string
}

export class DeleteBillUseCase {
  constructor(private billsRepository: BillsRepository) {}

  async execute(data: DeleteBillRequest) {
    const { billId } = data

    const bill = await this.billsRepository.findById(billId)
    if (!bill) throw new BillNotFoundError()

    // Ao invés de excluir, desativar a conta (active: false)
    // Isso evita que a conta seja gerada novamente nos meses seguintes
    await this.billsRepository.update(billId, {
      active: false,
    })
  }
}
