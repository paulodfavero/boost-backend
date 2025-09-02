import bcrypt from 'bcryptjs'
import { OrganizationsRepository } from '@/repositories/organization-repository'

interface ResetPasswordUseCaseRequest {
  email: string
  newPassword: string
}

export class ResetPasswordUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    email,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<void> {
    // Buscar organização pelo email
    const organization = await this.organizationsRepository.findByEmail(email)

    if (!organization) {
      throw new Error('Email não encontrado')
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 8)

    // Atualizar senha da organização
    await this.organizationsRepository.update({
      organizationId: organization.id,
      data: {
        password: hashedPassword,
      },
    })
  }
}
