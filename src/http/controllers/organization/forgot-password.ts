import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeForgotPasswordUseCase } from '@/use-cases/factories/make-forgot-password-use-case'

export async function forgotPassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const forgotPasswordBodySchema = z.object({
    email: z.string().email(),
    urlRedirect: z.string().url().optional(),
  })

  const { email, urlRedirect } = forgotPasswordBodySchema.parse(request.body)

  try {
    const forgotPasswordUseCase = makeForgotPasswordUseCase()

    await forgotPasswordUseCase.execute({
      email,
      urlRedirect,
    })

    return reply.status(200).send({
      message:
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    })
  } catch (err) {
    console.error('Erro no forgot password:', err)

    // Sempre retorna sucesso para não revelar se o email existe ou não
    return reply.status(200).send({
      message:
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    })
  }
}
