import { PrismaWalletsRepository } from '@/repositories/prisma/wallet-repository'
import { SearchWalletsUseCase } from '../search-wallets'

export function makeSearchWalletsUseCase() {
  const walletsRepository = new PrismaWalletsRepository()

  const useCase = new SearchWalletsUseCase(walletsRepository)

  return useCase
}
