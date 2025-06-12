import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { UpdateGoalUseCase } from '../update-goal'

export function makeUpdateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository()
  const useCase = new UpdateGoalUseCase(goalsRepository)

  return useCase
}
