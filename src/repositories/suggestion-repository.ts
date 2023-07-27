import { Prisma, Suggestion } from '@prisma/client'

export interface SuggestionsRepository {
  // searchMany(query: string): Promise<Suggestion[]>
  create(data: Prisma.SuggestionCreateInput): Promise<Suggestion>
}
