import { Company, Prisma } from '@prisma/client'

export interface CompaniesRepository {
  searchMany(query: string): Promise<Company[]>
  create(data: Prisma.CompanyCreateInput): Promise<Company>
  deleteManyByOrganization(organizationId: string): Promise<object>
}
