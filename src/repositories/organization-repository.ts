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
  findById(id: string): Promise<Organization | null>
  findByEmail(email: string): Promise<Organization | null>
  create(data: CreateOrganizationUseCaseResponse): Promise<Organization>
  update(data: UpdateOrganizationUseCaseResponse): Promise<Organization>
}
