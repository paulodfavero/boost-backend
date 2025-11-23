import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateBillUseCase } from '../create-bill'

export function makeCreateBillUseCase() {
  const billsRepository = new PrismaBillsRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const createBillUseCase = new CreateBillUseCase(
    billsRepository,
    organizationsRepository,
  )

  return createBillUseCase
}
