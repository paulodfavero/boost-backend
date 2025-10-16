import { User } from '@prisma/client'

interface CreateUserUseCaseResponse {
  name: string
  email: string
  image?: string
  organizationId: string
}
export interface UsersRepository {
  create(data: CreateUserUseCaseResponse): Promise<User>
  deleteManyByOrganization(organizationId: string): Promise<object>
}
