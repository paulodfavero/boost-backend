import { CategoriesRepository } from '@/repositories/category-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface DeleteCategoryType {
  organizationId: string
  categoryId: string
}

export class DeleteCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: DeleteCategoryType): Promise<object> {
    const { organizationId, categoryId } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.categoriesRepository.delete(categoryId)

    return response
  }
}
