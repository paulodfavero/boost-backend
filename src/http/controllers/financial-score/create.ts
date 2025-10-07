import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFinancialScoreUseCase } from '../../../use-cases/factories/make-financial-score-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const financialScoreBodySchema = z.object({
    organizationId: z.string(),
  })

  try {
    const { organizationId } = financialScoreBodySchema.parse(request.body)

    const financialScoreUseCase = makeFinancialScoreUseCase()
    const result = await financialScoreUseCase.execute({
      organizationId,
    })

    // Se não há dados, retorna mensagem vazia
    if (!result) {
      return reply.status(200).send({
        message: 'Não há dados suficientes para gerar a análise financeira',
      })
    }

    return reply.status(200).send(result)
  } catch (error) {
    console.error('Erro no financial-score:', error)

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
