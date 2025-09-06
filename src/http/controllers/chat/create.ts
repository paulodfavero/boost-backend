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
    const stream = await chatUseCase.execute({
      messages,
      organizationId,
    })

    // Configurar headers para streaming
    reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('Transfer-Encoding', 'chunked')

    // Enviar resposta como stream
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || ''
      if (token) {
        reply.raw.write(token)
      }
    }

    reply.raw.end()
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
