import { OrganizationsRepository } from '@/repositories/organization-repository'
import { EmailService } from '@/lib/email'
import bcrypt from 'bcryptjs'

interface CreateOrganizationUseCaseResponse {
  name: string
  email: string
  image?: string
  password?: string
  // cnpj?: string | undefined
  // cpf?: string | undefined
}

interface OrganizationResponse {
  id: string
  name: string
  email: string | null
  image?: string
  created: boolean
  organizationId: string
  hasPassword: boolean
  plan: string
  trialEnd?: Date | null
}

export class CreateOrganizationUseCase {
  userRepository: any
  private emailService: EmailService

  constructor(private organizationsRepository: OrganizationsRepository) {
    this.emailService = new EmailService()
  }

  async execute({
    name,
    email,
    image,
    password,
  }: CreateOrganizationUseCaseResponse): Promise<OrganizationResponse> {
    const hasOrganization = await this.organizationsRepository.findByEmail(
      email,
    )

    if (hasOrganization) {
      const {
        name,
        email,
        id: organizationId,
        password,
        plan,
        trial_end,
      } = hasOrganization
      return {
        id: organizationId,
        name,
        email,
        image,
        created: true,
        organizationId,
        hasPassword: !!password,
        plan,
        trialEnd: trial_end,
      }
    }

    const now = new Date()
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const data: any = {
      name,
      email,
      plan: 'TRIAL',
      trial_start: now,
      trial_end: trialEnd,
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      data.password = hashedPassword
    }

    const response = await this.organizationsRepository.create(data)

    // Enviar e-mail de boas-vindas apenas para novas organizações
    if (email) {
      try {
        await this.emailService.sendWelcomeEmail(email, name)
      } catch (error) {
        console.error('❌ Erro ao enviar e-mail de boas-vindas:', error)
        // Não falha a criação da organização se o e-mail falhar
      }
    }

    return {
      id: response.id,
      name,
      email,
      image,
      created: false,
      organizationId: response.id,
      hasPassword: !!password,
      plan: response.plan,
      trialEnd: response.trial_end,
    }
  }
}
