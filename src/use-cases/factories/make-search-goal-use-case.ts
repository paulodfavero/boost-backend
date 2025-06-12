import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { SearchGoalUseCase } from '../search-goal'
import { prisma } from '@/lib/prisma'

export function makeSearchGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const useCase = new SearchGoalUseCase(goalsRepository)

  return useCase
}
