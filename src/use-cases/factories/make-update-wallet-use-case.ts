import { PrismaWalletsRepository } from '@/repositories/prisma/wallet-repository'
import { UpdateWalletUseCase } from '../update-wallet'

export function makeUpdateWalletUseCase() {
  const walletsRepository = new PrismaWalletsRepository()

  const useCase = new UpdateWalletUseCase(walletsRepository)

  return useCase
}
