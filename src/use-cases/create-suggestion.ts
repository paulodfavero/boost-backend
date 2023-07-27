import { OrganizationsRepository } from '@/repositories/organization-repository'
import { SuggestionsRepository } from '@/repositories/suggestion-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { Suggestion } from '@prisma/client'

interface CreateSuggestionUseCaseResponse {
  amountByMonth: number
  isUseful: boolean
  message?: string | undefined
  organizationId: string
}

export class CreateSuggestionUseCase {
  constructor(
    private suggestionsRepository: SuggestionsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    amountByMonth,
    isUseful,
    message,
    organizationId,
  }: CreateSuggestionUseCaseResponse): Promise<Suggestion> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const suggestion = await this.suggestionsRepository.create({
      amount_by_month: amountByMonth,
      is_useful: isUseful,
      message,
      organizationId,
    })

    return suggestion
  }
}
