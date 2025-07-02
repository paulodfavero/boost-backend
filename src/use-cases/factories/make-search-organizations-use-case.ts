import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { SearchOrganizationsUseCase } from '../search-organizations'
import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'

export function makeSearchOrganizationsUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const banksRepository = new PrismaBanksRepository()
  const useCase = new SearchOrganizationsUseCase(
    organizationsRepository,
    banksRepository,
  )
  return useCase
}
