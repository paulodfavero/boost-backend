import { OrganizationsRepository } from '@/repositories/organization-repository'
import { CategoriesRepository } from '@/repositories/category-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { Category } from '@prisma/client'

interface CreateCategoryUseCaseResponse {
  name: string
  organizationId: string
}

export class CreateCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    name,
    organizationId,
  }: CreateCategoryUseCaseResponse): Promise<Category> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const category = await this.categoriesRepository.create({
      name,
      organizationId,
    })

    return category
  }
}
