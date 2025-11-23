import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { MarkBillAsPaidUseCase } from '../mark-bill-as-paid'

export function makeMarkBillAsPaidUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const markBillAsPaidUseCase = new MarkBillAsPaidUseCase(billsRepository)

  return markBillAsPaidUseCase
}
