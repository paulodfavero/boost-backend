import { OrganizationsRepository } from '@/repositories/organization-repository'
import { Organization } from '@prisma/client'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  image?: string
  // cnpj?: string | undefined
  // cpf?: string | undefined
}

export class CreateOrganizationUseCase {
  userRepository: any
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    name,
    email,
    image,
  }: CreateOrganizationUseCaseResponse): Promise<Organization> {
    const hasOrganization = await this.organizationsRepository.findByEmail(
      email,
    )

    if (hasOrganization) {
      const { name, email, id: organizationId } = hasOrganization
      return {
        created: true,
        name,
        email,
        image,
        organizationId,
      }
    }
    const response = await this.organizationsRepository.create({
      name,
      email,
    })

    return { name, email, image, organizationId: response.id }
  }
}
