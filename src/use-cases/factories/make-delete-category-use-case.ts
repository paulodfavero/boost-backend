import { PrismaCategoriesRepository } from '@/repositories/prisma/category-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { DeleteCategoryUseCase } from '../delete-category'

export function makeDeleteCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const deleteCategoryUseCase = new DeleteCategoryUseCase(
    categoriesRepository,
    organizationsRepository,
  )

  return deleteCategoryUseCase
}
