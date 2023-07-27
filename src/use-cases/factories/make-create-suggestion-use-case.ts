import { PrismaSuggestionsRepository } from '@/repositories/prisma/suggestion-repository'
import { CreateSuggestionUseCase } from '../create-suggestion'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateSuggestionUseCase() {
  const suggestionsRepository = new PrismaSuggestionsRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateSuggestionUseCase(
    suggestionsRepository,
    organizationRepository,
  )

  return useCase
}
