import { Category, Prisma } from '@prisma/client'

export interface CategoriesRepository {
  searchMany(query: string): Promise<Category[]>
  create(data: Prisma.CategoryCreateInput): Promise<Category>
}
