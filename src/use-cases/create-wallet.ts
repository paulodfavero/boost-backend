import { WalletsRepository } from '@/repositories/wallet-repository'

interface CreateWalletUseCaseRequest {
  name: string
  balance?: number
  organizationId: string
}

interface CreateWalletUseCaseResponse {
  wallet: {
    id: string
    name: string
    balance: number
    created_at: Date
    updated_at: Date
    organizationId: string
  }
}

export class CreateWalletUseCase {
  constructor(private walletsRepository: WalletsRepository) {}

  async execute({
    name,
    balance = 0,
    organizationId,
  }: CreateWalletUseCaseRequest): Promise<CreateWalletUseCaseResponse> {
    const wallet = await this.walletsRepository.create({
      name,
      balance,
      organizationId,
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
