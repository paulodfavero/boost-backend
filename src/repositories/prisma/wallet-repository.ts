import { Wallet } from '@prisma/client'
import {
  WalletsRepository,
  CreateWalletUseCaseResponse,
  UpdateWalletUseCaseResponse,
} from '../wallet-repository'
import { prisma } from '@/lib/prisma'

export class PrismaWalletsRepository implements WalletsRepository {
  async findById(id: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: {
        id,
      },
    })

    return wallet
  }

  async findByOrganizationId(organizationId: string): Promise<Wallet[]> {
    const wallets = await prisma.wallet.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return wallets
  }

  async create({
    name,
    balance = 0,
    organizationId,
  }: CreateWalletUseCaseResponse): Promise<Wallet> {
    const wallet = await prisma.wallet.create({
      data: {
        name,
        balance,
        organizationId,
      },
    })

    return wallet
  }

  async update({
    walletId,
    data,
  }: UpdateWalletUseCaseResponse): Promise<Wallet> {
    const wallet = await prisma.wallet.update({
      where: {
        id: walletId,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    })

    return wallet
  }

  async delete(id: string): Promise<Wallet> {
    const wallet = await prisma.wallet.delete({
      where: {
        id,
      },
    })

    return wallet
  }
}
