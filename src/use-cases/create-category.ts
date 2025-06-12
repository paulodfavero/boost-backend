import { CategoriesRepository } from '@/repositories/category-repository'
import { Category } from '@prisma/client'

interface CreateCategoryUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
}
interface CategoryType {
  reqBody: CreateCategoryUseCaseResponse[]
}
export class CreateCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(data: CategoryType): Promise<Category> {
    const { reqBody: categories } = data
    const category = await this.categoriesRepository.createMany(categories)

    return category
  }
}
