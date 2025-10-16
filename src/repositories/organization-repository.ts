import { Organization } from '@prisma/client'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  // cnpj: string
  // cpf: string
}
// Atualizado para aceitar qualquer campo da Organization, exceto o id
export interface UpdateOrganizationUseCaseResponse {
  organizationId: string
  data: Partial<Omit<Organization, 'id' | 'created_at'>>
}
export interface OrganizationsRepository {
  findById(id: string): Promise<Organization | null>
  findByEmail(email: string): Promise<Organization | null>
  create(data: CreateOrganizationUseCaseResponse): Promise<Organization>
  update(data: UpdateOrganizationUseCaseResponse): Promise<Organization>
  delete(id: string): Promise<Organization>
  searchMany(
    date?: string,
  ): Promise<Organization[] | Record<string, Organization[]>>
}
