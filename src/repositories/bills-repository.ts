import { Bill, Prisma } from '@prisma/client'

export interface BillsRepository {
  searchMany(
    organizationId: string,
    month?: string,
    year?: string,
    paid?: boolean,
  ): Promise<Bill[]>
  create(data: Prisma.BillCreateInput): Promise<Bill>
  findById(billId: string): Promise<Bill | null>
  findBySourceTransactionId(
    sourceTransactionId: string,
    organizationId: string,
  ): Promise<Bill | null>
  update(billId: string, data: Prisma.BillUpdateInput): Promise<Bill>
  markAsPaid(billId: string, paid: boolean): Promise<Bill>
  delete(billId: string): Promise<void>
  deleteManyByOrganization(organizationId: string): Promise<void>
  findActiveBills(organizationId: string): Promise<Bill[]>
}
