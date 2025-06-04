import { OrganizationsRepository } from '@/repositories/organization-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import bcrypt from 'bcryptjs'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  organization: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export class AuthenticateUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const organization = await this.organizationsRepository.findByEmail(email)

    if (!organization) {
      throw new InvalidCredentialsError()
    }

    if (!organization.password) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await bcrypt.compare(
      password,
      organization.password,
    )

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }
    return {
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        image: organization.image,
      },
    }
  }
}
