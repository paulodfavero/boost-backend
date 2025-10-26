import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { SearchCreditsProjectionUseCase } from '../search-credits-projection'

export function makeSearchCreditsProjectionUseCase() {
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const searchCreditsProjectionUseCase = new SearchCreditsProjectionUseCase(
    creditsProjectionRepository,
    banksTypeAccountRepository,
  )

  return searchCreditsProjectionUseCase
}
