import { PrismaCompaniesRepository } from '@/repositories/prisma/company-repository'
import { SearchCompanyUseCase } from '../search-companies'

export function makeSearchCompanyUseCase() {
  const companyRepository = new PrismaCompaniesRepository()

  const useCase = new SearchCompanyUseCase(companyRepository)

  return useCase
}
