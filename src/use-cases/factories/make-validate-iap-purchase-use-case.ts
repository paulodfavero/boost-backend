import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { ValidateIAPPurchaseUseCase } from '../validate-iap-purchase'

export function makeValidateIAPPurchaseUseCase() {
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new ValidateIAPPurchaseUseCase(organizationRepository)

  return useCase
}
