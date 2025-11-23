import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { UpdateBillUseCase } from '../update-bill'

export function makeUpdateBillUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const updateBillUseCase = new UpdateBillUseCase(billsRepository)

  return updateBillUseCase
}
