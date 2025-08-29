import nodemailer from 'nodemailer'
import { env } from '@/env'

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Só cria o transporter se as variáveis SMTP estiverem configuradas
    if (env.SMTP_USER && env.SMTP_PASS) {
      const port = env.SMTP_PORT || 587
      const secure = port === 465 // SSL para porta 465, TLS para outras

      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    urlRedirect?: string,
  ) {
    // Se não há configuração SMTP, apenas loga o token
    if (!this.transporter) {
      return urlRedirect
        ? `${urlRedirect}?token=${token}`
        : `${env.SITE_URL}/reset-password?token=${token}`
    }

    const resetUrl = urlRedirect
      ? `${urlRedirect}?token=${token}&email=${email}`
      : `${env.SITE_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: env.SMTP_USER,
      to: email,
      subject: 'Redefinição de Senha - Boost Finance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Redefinição de Senha</h2>
          <p>Olá!</p>
          <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #6240CB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;" rel="nofollow noopener noreferrer" target="_blank">
              Redefinir Senha
            </a>
          </p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p>Este link expira em 1 hora.</p>
          <p>Atenciosamente,<br>Equipe Boost Finance</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <a href="${resetUrl}" style="color: #6240CB;">${resetUrl}</a>
          </p>
        </div>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error)
    }
  }
}
