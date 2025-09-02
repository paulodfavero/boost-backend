import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeResetPasswordUseCase } from '@/use-cases/factories/make-reset-password-use-case'

export async function resetPassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const resetPasswordBodySchema = z.object({
    email: z.string().email(),
    newPassword: z.string().min(6),
  })

  const { email, newPassword } = resetPasswordBodySchema.parse(request.body)

  try {
    const resetPasswordUseCase = makeResetPasswordUseCase()

    await resetPasswordUseCase.execute({
      email,
      newPassword,
    })

    return reply.status(200).send({
      message: 'Senha redefinida com sucesso.',
    })
  } catch (err) {
    if (err instanceof Error) {
      return reply.status(400).send({ message: err.message })
    }

    return reply.status(500).send({ message: 'Erro interno do servidor' })
  }
}
