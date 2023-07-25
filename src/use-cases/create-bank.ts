import { OrganizationsRepository } from '@/repositories/organization-repository'
import { BanksRepository } from '@/repositories/bank-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { Bank, Prisma } from '@prisma/client'

interface CreateBankUseCaseResponse {
  itemId: string
  name: string
  primaryColor: string
  institutionUrl: string
  type: string
  imageUrl: string
  hasMFA: boolean
  products?: Prisma.BankCreateproductsInput | undefined
  status: string
  lastUpdatedAt: string | Date
  organizationId: string
}

export class CreateBankUseCase {
  constructor(
    private categoriesRepository: BanksRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products,
    status,
    lastUpdatedAt,
    organizationId,
  }: CreateBankUseCaseResponse): Promise<Bank> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.categoriesRepository.create({
      name,
      item_id: itemId,
      primary_color: primaryColor,
      institution_url: institutionUrl,
      type,
      image_url: imageUrl,
      has_mfa: hasMFA,
      products,
      status,
      last_updated_at: lastUpdatedAt,
      organizationId,
    })
    const { id } = response
    return {
      id,
      name,
      itemId,
      primaryColor,
      institutionUrl,
      type,
      imageUrl,
      hasMFA,
      products,
      status,
      lastUpdatedAt,
      organizationId,
    }
  }
}
