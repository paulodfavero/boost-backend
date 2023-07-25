import { PrismaCompaniesRepository } from '@/repositories/prisma/company-repository'
import { CreateCompanyUseCase } from '../create-company'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateCompanyUseCase() {
  const companyRepository = new PrismaCompaniesRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateCompanyUseCase(
    companyRepository,
    organizationRepository,
  )

  return useCase
}
