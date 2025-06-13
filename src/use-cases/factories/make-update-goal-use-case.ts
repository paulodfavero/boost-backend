import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { UpdateGoalUseCase } from '../update-goal'
import { prisma } from '@/lib/prisma'

export function makeUpdateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const useCase = new UpdateGoalUseCase(goalsRepository)

  return useCase
}
