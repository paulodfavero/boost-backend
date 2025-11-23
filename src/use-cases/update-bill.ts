import { BillsRepository } from '@/repositories/bills-repository'
import { BillNotFoundError } from './errors/bill-not-found-error'
import { Prisma } from '@prisma/client'

interface UpdateBillRequest {
  billId: string
  description?: string
  company?: string
  category?: string | null
  amount?: number
  expirationDate?: string | Date
  dayOfMonth?: number
  active?: boolean
}

export class UpdateBillUseCase {
  constructor(private billsRepository: BillsRepository) {}

  async execute(data: UpdateBillRequest) {
    const {
      billId,
      description,
      company,
      category,
      amount,
      expirationDate,
      dayOfMonth,
      active,
    } = data

    const bill = await this.billsRepository.findById(billId)
    if (!bill) throw new BillNotFoundError()

    const updateData: Prisma.BillUpdateInput = {}

    if (description !== undefined) updateData.description = description
    if (company !== undefined) updateData.company = company
    if (category !== undefined) updateData.category = category
    if (amount !== undefined) updateData.amount = amount
    if (expirationDate !== undefined)
      updateData.expiration_date = new Date(expirationDate)
    if (dayOfMonth !== undefined) updateData.day_of_month = dayOfMonth
    if (active !== undefined) updateData.active = active

    const updatedBill = await this.billsRepository.update(billId, updateData)

    return updatedBill
  }
}
