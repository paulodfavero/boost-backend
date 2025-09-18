import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  makeSearchCreditCardListUseCase,
  makeSearchCreditUseCase,
} from '@/use-cases/factories/make-search-credit-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Aplicar middleware de cache
    await cacheMiddleware(cacheConfigs.credits)(request, reply)

    // Se o cache retornou dados, a função já foi finalizada
    if (reply.sent) {
      console.log('🎯 GET /credit - Cache HIT - Dados retornados do cache')
      return
    }

    console.log(
      '🔄 GET /credit - Cache MISS - Executando busca no banco de dados',
    )

    const searchQueryCreditsSchema = z.object({
      a: z.string(),
      date: z.string(),
      bankId: z.string().nullish(),
    })

    const { a, date, bankId } = searchQueryCreditsSchema.parse(request.query)
    const searchCreditsUseCase = makeSearchCreditUseCase()

    const data = await searchCreditsUseCase.execute({
      organizationId: a,
      date,
      bankId: bankId || '',
    })

    // Salvar no cache
    saveToCache(request, data, cacheConfigs.credits)
    console.log('💾 GET /credit - Dados salvos no cache')

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de créditos:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de créditos',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}

export async function searchCreditByOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const searchQueryCreditsSchema = z.object({
      organizationId: z.string(),
    })

    const { organizationId } = searchQueryCreditsSchema.parse(request.params)
    const searchCreditsUseCase = makeSearchCreditCardListUseCase()

    const data = await searchCreditsUseCase.execute({
      organizationId,
    })
    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de cartões de crédito por organização:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de cartões de crédito',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
