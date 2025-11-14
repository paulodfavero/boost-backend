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
    // Log detalhado do erro para debug
    console.error('=== ERRO NO FINANCIAL-SCORE ===')
    console.error('Timestamp:', new Date().toISOString())
    console.error('Error type:', error?.constructor?.name)
    console.error(
      'Error message:',
      error instanceof Error ? error.message : String(error),
    )
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    if (error instanceof z.ZodError) {
      console.error(
        'Zod validation errors:',
        JSON.stringify(error.errors, null, 2),
      )
    }
    console.error('Request body:', JSON.stringify(request.body, null, 2))
    console.error('===============================')

    // Se for erro de validação do Zod, retornar erro 400
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: error.errors,
      })
    }

    // Se for erro do use case (ex: organização não encontrada)
    if (error instanceof Error) {
      console.error('Erro no financial-score:', error)
      return reply.status(400).send({
        error: error.message || 'Erro na requisição',
      })
    }

    return reply.status(500).send({ error: 'Erro interno do servidor' })
  }
}
