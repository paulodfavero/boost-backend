import { WalletsRepository } from '@/repositories/wallet-repository'

interface UpdateWalletUseCaseRequest {
  walletId: string
  name?: string
  balance?: number
}

interface UpdateWalletUseCaseResponse {
  wallet: {
    id: string
    name: string
    balance: number
    created_at: Date
    updated_at: Date
    organizationId: string
  }
}

export class UpdateWalletUseCase {
  constructor(private walletsRepository: WalletsRepository) {}

  async execute({
    walletId,
    name,
    balance,
  }: UpdateWalletUseCaseRequest): Promise<UpdateWalletUseCaseResponse> {
    const wallet = await this.walletsRepository.update({
      walletId,
      data: {
        ...(name !== undefined && { name }),
        ...(balance !== undefined && { balance }),
      },
    })

    return {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        balance: wallet.balance,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at,
        organizationId: wallet.organizationId,
      },
    }
  }
}
