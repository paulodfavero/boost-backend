import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeChatUseCase } from '@/use-cases/factories/make-chat-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const chatBodySchema = z.object({
    messages: z.array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      }),
    ),
    organizationId: z.string(),
  })

  try {
    const { messages, organizationId } = chatBodySchema.parse(request.body)

    const chatUseCase = makeChatUseCase()
    const result = await chatUseCase.execute({
      messages,
      organizationId,
    })

    // Retornar o prompt montado como JSON para o frontend chamar a OpenAI
    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro no chat:', error)

    // Se for erro de validação do Zod, retornar erro 400
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: error.errors,
      })
    }

    return reply.status(500).send({ error: 'Erro interno do servidor' })
  }
}
