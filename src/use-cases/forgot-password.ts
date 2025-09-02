import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'
import { PasswordResetRepository } from '@/repositories/password-reset-repository'
import { EmailService } from '@/lib/email'

interface ForgotPasswordUseCaseRequest {
  email: string
  urlRedirect?: string
}

export class ForgotPasswordUseCase {
  constructor(
    private passwordResetRepository: PasswordResetRepository,
    private emailService: EmailService,
  ) {}

  async execute({
    email,
    urlRedirect,
  }: ForgotPasswordUseCaseRequest): Promise<void> {
    // Gerar token único
    const token = randomBytes(32).toString('hex')

    // Definir expiração (1 hora)
    const expires = addHours(new Date(), 1)

    // Salvar token no banco (implementação simplificada)
    await this.passwordResetRepository.create({
      token,
      email,
      expires,
    })

    // Enviar email (não lança erro se falhar)
    await this.emailService.sendPasswordResetEmail(email, token, urlRedirect)
  }
}
