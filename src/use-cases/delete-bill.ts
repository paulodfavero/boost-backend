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

    await this.billsRepository.delete(billId)
  }
}
