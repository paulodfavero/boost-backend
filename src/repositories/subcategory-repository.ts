import { SubCategory } from '@prisma/client'

export interface CreateSubcategoryUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
  categoryId: string
  parentDescription: string
}

export interface SubCategoriesRepository {
  searchMany(): Promise<SubCategory[]>
  createMany(data: CreateSubcategoryUseCaseResponse[]): Promise<SubCategory>
}
