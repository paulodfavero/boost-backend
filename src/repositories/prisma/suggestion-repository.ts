import { prisma } from '@/lib/prisma'
import { SuggestionsRepository } from '../suggestion-repository'
import { Prisma } from '@prisma/client'

export class PrismaSuggestionsRepository implements SuggestionsRepository {
  async create(data: Prisma.SuggestionCreateInput) {
    const suggestion = await prisma.suggestion.create({
      data,
    })

    return suggestion
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.suggestion.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
