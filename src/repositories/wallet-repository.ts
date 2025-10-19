import { Wallet } from '@prisma/client'

export interface CreateWalletUseCaseResponse {
  name: string
  balance?: number
  organizationId: string
}

export interface UpdateWalletUseCaseResponse {
  walletId: string
  data: Partial<Omit<Wallet, 'id' | 'created_at' | 'organizationId'>>
}

export interface WalletsRepository {
  findById(id: string): Promise<Wallet | null>
  findByOrganizationId(organizationId: string): Promise<Wallet[]>
  create(data: CreateWalletUseCaseResponse): Promise<Wallet>
  update(data: UpdateWalletUseCaseResponse): Promise<Wallet>
  delete(id: string): Promise<Wallet>
}
