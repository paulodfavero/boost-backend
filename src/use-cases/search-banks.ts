import {
  BanksRepository,
  BanksTypeAccountRepository,
} from '@/repositories/bank-repository'

interface SearchBankUseCaseRequest {
  query: string
}
interface SearchBankTypeAccountUseCaseRequest {
  query: string
}

export class SearchBankUseCase {
  constructor(
    private banksRepository: BanksRepository,
    private banksTypeAccountRepository: BanksTypeAccountRepository,
  ) {}

  async execute({ query }: SearchBankUseCaseRequest): Promise<object> {
    const banks = await this.banksRepository.searchMany(query)

    const bankFormated = await Promise.all(
      banks.map(
        async ({
          id,
          item_id,
          name,
          name_alias,
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
          const bankTypeAccounts =
            await this.banksTypeAccountRepository.findByItemId(item_id)

          return {
            id,
            itemId: item_id,
            name,
            nameAlias: name_alias,
            primaryColor: primary_color,
            institutionUrl: institution_url,
            type,
            imageUrl: image_url,
            hasMFA: has_mfa,
            products,
            status,
            lastUpdatedAt: last_updated_at,
            organizationId,
            bankTypeAccounts,
          }
        },
      ),
    )

    return bankFormated
  }
}
export class SearchBankTypeAccountUseCase {
  constructor(private banksTypeAccountRepository: BanksTypeAccountRepository) {}
  async execute({
    query,
  }: SearchBankTypeAccountUseCaseRequest): Promise<object> {
    const bankTypeAccount = await this.banksTypeAccountRepository.findById(
      query,
    )

    return { bankTypeAccount }
  }
}
// export class SearchBanksUseCase {
//   constructor(private banksRepository: BanksTypeAccountRepository) {}
//   async execute({
//     query,
//   }: SearchBankTypeAccountUseCaseRequest): Promise<object> {
//     const bankTypeAccount = await this.banksRepository.findByOrganizationId(
//       query,
//     )

//     return bankTypeAccount
//   }
// }
