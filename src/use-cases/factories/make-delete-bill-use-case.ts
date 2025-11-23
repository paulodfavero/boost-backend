import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { DeleteBillUseCase } from '../delete-bill'

export function makeDeleteBillUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const deleteBillUseCase = new DeleteBillUseCase(billsRepository)

  return deleteBillUseCase
}
