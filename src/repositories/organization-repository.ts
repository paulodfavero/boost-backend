import { Organization } from '@prisma/client'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  // cnpj: string
  // cpf: string
}
export interface OrganizationsRepository {
  findById(organizationId: string): unknown
  findByEmail(email: string): unknown
  create(data: CreateOrganizationUseCaseResponse): Promise<Organization>
}
