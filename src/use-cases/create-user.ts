import { OrganizationsRepository } from '@/repositories/organization-repository'
import { UsersRepository } from '@/repositories/user-repository'
import { User } from '@prisma/client'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreateUserUseCaseResponse {
  name: string
  email: string
  image?: string
  organizationId: string
}

export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreateUserUseCaseResponse): Promise<User> {
    const reqBody = data
    const { name, email, image, organizationId } = reqBody

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.usersRepository.create({
      name,
      email,
      image,
      organizationId,
    })
    return response
  }
}
