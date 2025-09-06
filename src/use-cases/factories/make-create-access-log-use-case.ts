import { PrismaAccessLogRepository } from '@/repositories/access-log-repository'
import { CreateAccessLogUseCase } from '../create-access-log'

export function makeCreateAccessLogUseCase() {
  const accessLogRepository = new PrismaAccessLogRepository()
  const useCase = new CreateAccessLogUseCase(accessLogRepository)

  return useCase
}
