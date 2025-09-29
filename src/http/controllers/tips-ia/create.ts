import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeTipsIaUseCase } from '../../../use-cases/factories/make-tips-ia-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const tipsIaBodySchema = z.object({
    organizationId: z.string(),
  })

  try {
    const { organizationId } = tipsIaBodySchema.parse(request.body)

    const tipsIaUseCase = makeTipsIaUseCase()
    const result = await tipsIaUseCase.execute({
      organizationId,
    })

    // Se não há despesas, retorna mensagem vazia
    if (!result) {
      return reply.status(200).send('')
    }

    // // Configurar headers para streaming
    // reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8')
    // reply.raw.setHeader('Cache-Control', 'no-cache')
    // reply.raw.setHeader('Connection', 'keep-alive')
    // reply.raw.setHeader('Transfer-Encoding', 'chunked')

    // Enviar resposta como stream
    // for await (const chunk of stream) {
    //   const token = chunk.choices[0]?.delta?.content || ''
    //   if (token) {
    //     reply.raw.write(token)
    //   }
    // }
    return reply.status(200).send(result)

    // reply.raw.end()
  } catch (error) {
    console.error('Erro no tips-ia:', error)

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
