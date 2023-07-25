import { BanksRepository } from '@/repositories/bank-repository'

interface SearchBankUseCaseRequest {
  query: string
}

export class SearchBankUseCase {
  constructor(private banksRepository: BanksRepository) {}

  async execute({ query }: SearchBankUseCaseRequest): Promise<object> {
    const banks = await this.banksRepository.searchMany(query)

    const bankFormated = banks.map(
      ({
        id,
        item_id,
        name,
        primary_color,
        institution_url,
        type,
        image_url,
        has_mfa,
        products,
        status,
        last_updated_at,
        organizationId,
      }) => {
        return {
          id,
          itemId: item_id,
          name,
          primaryColor: primary_color,
          institutionUrl: institution_url,
          type,
          imageUrl: image_url,
          hasMFA: has_mfa,
          products,
          status,
          lastUpdatedAt: last_updated_at,
          organizationId,
        }
      },
    )

    return bankFormated
  }
}
