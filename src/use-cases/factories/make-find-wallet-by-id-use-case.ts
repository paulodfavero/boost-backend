import { PrismaWalletsRepository } from '@/repositories/prisma/wallet-repository'
import { FindWalletByIdUseCase } from '../find-wallet-by-id'

export function makeFindWalletByIdUseCase() {
  const walletsRepository = new PrismaWalletsRepository()

  const useCase = new FindWalletByIdUseCase(walletsRepository)

  return useCase
}
