import { PrismaWalletsRepository } from '@/repositories/prisma/wallet-repository'
import { DeleteWalletUseCase } from '../delete-wallet'

export function makeDeleteWalletUseCase() {
  const walletsRepository = new PrismaWalletsRepository()

  const useCase = new DeleteWalletUseCase(walletsRepository)

  return useCase
}
