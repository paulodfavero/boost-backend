import { PrismaWalletsRepository } from '@/repositories/prisma/wallet-repository'
import { CreateWalletUseCase } from '../create-wallet'

export function makeCreateWalletUseCase() {
  const walletsRepository = new PrismaWalletsRepository()

  const useCase = new CreateWalletUseCase(walletsRepository)

  return useCase
}
