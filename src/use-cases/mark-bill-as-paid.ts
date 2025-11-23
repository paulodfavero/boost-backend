import { BillsRepository } from '@/repositories/bills-repository'
import { BillNotFoundError } from './errors/bill-not-found-error'

interface MarkBillAsPaidRequest {
  billId: string
  paid: boolean
}

export class MarkBillAsPaidUseCase {
  constructor(private billsRepository: BillsRepository) {}

  async execute(data: MarkBillAsPaidRequest) {
    const { billId, paid } = data

    const bill = await this.billsRepository.findById(billId)
    if (!bill) throw new BillNotFoundError()

    const updatedBill = await this.billsRepository.markAsPaid(billId, paid)

    return updatedBill
  }
}
