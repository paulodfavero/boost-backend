import { WalletsRepository } from '@/repositories/wallet-repository'

interface DeleteWalletUseCaseRequest {
  walletId: string
}

interface DeleteWalletUseCaseResponse {
  wallet: {
    id: string
    name: string
    balance: number
    created_at: Date
    updated_at: Date
    organizationId: string
  }
}

export class DeleteWalletUseCase {
  constructor(private walletsRepository: WalletsRepository) {}

  async execute({
    walletId,
  }: DeleteWalletUseCaseRequest): Promise<DeleteWalletUseCaseResponse> {
    const wallet = await this.walletsRepository.findById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    const deletedWallet = await this.walletsRepository.delete(walletId)

    return {
      wallet: {
        id: deletedWallet.id,
        name: deletedWallet.name,
        balance: deletedWallet.balance,
        created_at: deletedWallet.created_at,
        updated_at: deletedWallet.updated_at,
        organizationId: deletedWallet.organizationId,
      },
    }
  }
}
