import { WalletsRepository } from '@/repositories/wallet-repository'

interface SearchWalletsUseCaseRequest {
  organizationId: string
}

interface SearchWalletsUseCaseResponse {
  id: string
  name: string
  balance: number
  created_at: Date
  updated_at: Date
  organizationId: string
}

export class SearchWalletsUseCase {
  constructor(private walletsRepository: WalletsRepository) {}

  async execute({
    organizationId,
  }: SearchWalletsUseCaseRequest): Promise<SearchWalletsUseCaseResponse[]> {
    const wallets = await this.walletsRepository.findByOrganizationId(
      organizationId,
    )
    const walletsFormatted = wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      balance: wallet.balance,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at,
      organizationId: wallet.organizationId,
    }))
    return walletsFormatted
  }
}
