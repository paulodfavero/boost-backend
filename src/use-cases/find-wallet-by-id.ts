import { WalletsRepository } from '@/repositories/wallet-repository'

interface FindWalletByIdUseCaseRequest {
  walletId: string
}

interface FindWalletByIdUseCaseResponse {
  id: string
  name: string
  balance: number
  created_at: Date
  updated_at: Date
  organizationId: string
}

export class FindWalletByIdUseCase {
  constructor(private walletsRepository: WalletsRepository) {}

  async execute({
    walletId,
  }: FindWalletByIdUseCaseRequest): Promise<FindWalletByIdUseCaseResponse> {
    const wallet = await this.walletsRepository.findById(walletId)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return {
      id: wallet.id,
      name: wallet.name,
      balance: wallet.balance,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at,
      organizationId: wallet.organizationId,
    }
  }
}
