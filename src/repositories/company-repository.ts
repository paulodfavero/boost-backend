import { Company } from '@prisma/client'
interface CreateCompanyUseCaseResponse {
  name: string
  organizationId: string
}
export interface CompaniesRepository {
  searchMany(query: string): Promise<Company[]>
  create(data: CreateCompanyUseCaseResponse): Promise<Company>
}
