import { PrismaCategoriesRepository } from '@/repositories/prisma/category-repository'
import { CreateCategoryUseCase } from '../create-category'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateCategoryUseCase() {
  const categoryRepository = new PrismaCategoriesRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateCategoryUseCase(
    categoryRepository,
    organizationRepository,
  )

  return useCase
}
