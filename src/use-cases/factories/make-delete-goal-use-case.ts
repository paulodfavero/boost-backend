import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { DeleteGoalUseCase } from '../delete-goals'
import { prisma } from '@/lib/prisma'

export function makeDeleteGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const useCase = new DeleteGoalUseCase(goalsRepository)

  return useCase
}
