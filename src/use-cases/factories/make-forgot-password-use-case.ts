import { PrismaPasswordResetRepository } from '@/repositories/prisma/prisma-password-reset-repository'
import { EmailService } from '@/lib/email'
import { ForgotPasswordUseCase } from '../forgot-password'

export function makeForgotPasswordUseCase() {
  const passwordResetRepository = new PrismaPasswordResetRepository()
  const emailService = new EmailService()
  const useCase = new ForgotPasswordUseCase(
    passwordResetRepository,
    emailService,
  )

  return useCase
}
