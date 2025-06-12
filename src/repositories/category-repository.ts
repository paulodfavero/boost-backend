import { Category } from '@prisma/client'

export interface CreateCategoryUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
}

export interface CategoriesRepository {
  searchMany(): Promise<Category[]>
  createMany(data: CreateCategoryUseCaseResponse[]): Promise<Category>
}
