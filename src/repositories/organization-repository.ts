import { Organization } from '@prisma/client'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  // cnpj: string
  // cpf: string
}
interface UpdateOrganizationUseCaseResponse {
  organizationId: string
  stripeCustomerId: string
}
export interface OrganizationsRepository {
  findById(id: string): unknown
  findByEmail(email: string): unknown
  create(data: CreateOrganizationUseCaseResponse): Promise<Organization>
  update(data: UpdateOrganizationUseCaseResponse): Promise<object>
}
