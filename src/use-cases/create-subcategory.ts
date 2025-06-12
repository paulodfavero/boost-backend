import { SubCategoriesRepository } from '@/repositories/subcategory-repository'
import { SubCategoryCreditCard } from '@prisma/client'

interface CreateSubsubcategoryUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
  categoryId: string
  parentDescription: string
}
interface SubcategoryType {
  reqBody: CreateSubsubcategoryUseCaseResponse[]
}
export class CreateSubcategoryUseCase {
  constructor(private categoriesRepository: SubCategoriesRepository) {}

  async execute(data: SubcategoryType): Promise<SubCategoryCreditCard> {
    const { reqBody: subcategories } = data
    console.log(
      '%csrc/use-cases/create-subcategory.ts:19 subcategories',
      'color: #007acc;',
      subcategories,
    )
    const subcategory = await this.categoriesRepository.createMany(
      subcategories,
    )

    return subcategory
  }
}
