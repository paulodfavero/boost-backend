import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { SearchGoalUseCase } from '../search-goal'

export function makeSearchGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new SearchGoalUseCase(goalsRepository)

  return useCase
}
