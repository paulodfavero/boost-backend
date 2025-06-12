import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { CreateGoalUseCase } from '../create-goals'
import { prisma } from '@/lib/prisma'

export function makeCreateGoalUseCase() {
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const useCase = new CreateGoalUseCase(goalsRepository)

  return useCase
}
