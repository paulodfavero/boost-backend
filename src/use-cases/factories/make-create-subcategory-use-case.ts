import { PrismaSubcategoriesRepository } from '@/repositories/prisma/subcategory-repository'
import { CreateSubcategoryUseCase } from '../create-subcategory'

export function makeCreateSubcategoryUseCase() {
  const subcategoryRepository = new PrismaSubcategoriesRepository()

  const useCase = new CreateSubcategoryUseCase(subcategoryRepository)

  return useCase
}
