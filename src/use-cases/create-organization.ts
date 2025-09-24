import { OrganizationsRepository } from '@/repositories/organization-repository'
import { EmailService } from '@/lib/email'
import bcrypt from 'bcryptjs'
import { OrganizationAlreadyExistsError } from './errors/organization-already-exist'
import { getPlanTypeFromStripe } from '../lib/stripe-helper'

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
  planType: string
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
      if (hasOrganization.password) throw new OrganizationAlreadyExistsError()
      await this.organizationsRepository.update({
        organizationId: hasOrganization.id,
        data: {
          updated_at: new Date(),
        },
      })

      const {
        name,
        email,
        id: organizationId,
        password,
        plan,
        trial_end,
        stripe_customer_id,
      } = hasOrganization

      // Get plan type from Stripe or IAP
      const planType = await getPlanTypeFromStripe(stripe_customer_id, {
        plan,
        apple_iap_transaction_id: hasOrganization.apple_iap_transaction_id,
      })
      return {
        id: organizationId,
        name,
        email,
        image,
        created: true,
        organizationId,
        hasPassword: !!password,
        plan,
        planType,
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

    if (email) {
      try {
        await this.emailService.sendWelcomeEmail(email, name)
        await this.organizationsRepository.update({
          organizationId: response.id,
          data: {
            welcome_email_sent: true,
          },
        })
      } catch (error) {
        console.error('❌ Erro ao enviar e-mail de boas-vindas:', error)
        // Não falha a criação da organização se o e-mail falhar
      }
    }

    // Get plan type from Stripe or IAP (will be TRIAL for new organizations)
    const planType = await getPlanTypeFromStripe(response.stripe_customer_id, {
      plan: response.plan,
      apple_iap_transaction_id: response.apple_iap_transaction_id,
    })

    return {
      id: response.id,
      name,
      email,
      image,
      created: false,
      organizationId: response.id,
      hasPassword: !!password,
      plan: response.plan,
      planType,
      trialEnd: response.trial_end,
    }
  }
}
