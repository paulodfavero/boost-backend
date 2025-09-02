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

  async sendWelcomeEmail(email: string, organizationName: string) {
    // Se não há configuração SMTP, apenas loga
    if (!this.transporter) {
      return
    }

    const mailOptions = {
      from: env.SMTP_USER,
      to: email,
      subject: 'Boas vindas à Boost Finance! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; border-radius: 30px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 10px; background-color: #6240cb; padding: 10px; border-radius: 5px;">
              <img src="https://www.boostfinance.com.br/_next/static/media/logo.919aa7c6.svg" width="28" height="28" alt="Boost Finance Logo" style="height: 28px; width: 28px;">
            </div>
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6240cb; margin: 0; font-size: 24px;">
              
              🎉 Boas vindas à Boost Finance!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Olá <strong>${organizationName}</strong>, tudo bem? 👋
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Que bom ter você por aqui. A partir de agora, sua jornada para organizar e entender melhor o seu dinheiro ficou muito mais simples.
            </p>
            
            <div style="background-color: #f0f4ff; border-left: 4px solid #6240cb; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #6240cb; margin-top: 0;">🚀 Na Boost Finance, você encontra:</h3>
              <ul style="color: #555; line-height: 1.8; list-style-type: none; padding: 0">
                <li>✨ Gerenciar suas despesas e receitas</li>
                <li>✨ Criar categorias personalizadas</li>
                <li>✨ Configurar metas financeiras</li>
                <li>✨ Conectar suas contas bancárias</li>
                <li>✨ Acompanhar seus gastos com cartão de crédito</li>
                <li>✨ Analisar relatórios detalhados</li>
                <li>✨ Dicas para economizar mais com apoio da IA</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.SITE_URL}/home" style="background-color: #6240cb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;" rel="nofollow noopener noreferrer" target="_blank">
                Acessar Minha Conta
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              E pode ficar de boa: se pintar qualquer dúvida, nosso time está pronto para ajudar.<br>
              É só mandar mensagem no WhatsApp 👉 +55 21 95936-4718.
            </p>
            
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Bora juntos transformar a forma como você cuida da sua grana?
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              Abraços da<br>
              <strong>Equipe Boost Finance 🚀</strong>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                Este é um e-mail automático, não é necessário respondê-lo. Mas se quiser, fique a vontade ;)
              </p>
            </div>
          </div>
        </div>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`✅ E-mail de boas-vindas enviado com sucesso para: ${email}`)
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error)
      throw error
    }
  }
}
