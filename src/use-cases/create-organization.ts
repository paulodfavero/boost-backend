import { OrganizationsRepository } from '@/repositories/organization-repository'
import bcrypt from 'bcryptjs'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  image?: string
  password?: string
  // cnpj?: string | undefined
  // cpf?: string | undefined
}

interface OrganizationResponse {
  id: string
  name: string
  email: string | null
  image?: string
  created: boolean
  organizationId: string
  hasPassword: boolean
}

export class CreateOrganizationUseCase {
  userRepository: any
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    name,
    email,
    image,
    password,
  }: CreateOrganizationUseCaseResponse): Promise<OrganizationResponse> {
    const hasOrganization = await this.organizationsRepository.findByEmail(
      email,
    )

    if (hasOrganization) {
      const { name, email, id: organizationId, password } = hasOrganization
      return {
        id: organizationId,
        name,
        email,
        image,
        created: true,
        organizationId,
        hasPassword: !!password,
      }
    }

    const data: any = {
      name,
      email,
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      data.password = hashedPassword
    }

    const response = await this.organizationsRepository.create(data)

    return {
      id: response.id,
      name,
      email,
      image,
      created: false,
      organizationId: response.id,
      hasPassword: !!password,
    }
  }
}
