import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  makeSearchBankOrganizationIdsUseCase,
  makeSearchBankTypeAccountUseCase,
  makeSearchBankUseCase,
} from '@/use-cases/factories/make-search-bank-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware(cacheConfigs.banks)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchBanksQuerySchema = z.object({
    a: z.string(),
  })

  const { a } = searchBanksQuerySchema.parse(request.query)
  const searchBankUseCase = makeSearchBankUseCase()

  const data = await searchBankUseCase.execute({
    query: a,
  })

  // Salvar no cache
  saveToCache(request, data, cacheConfigs.banks)

  return reply.status(200).send(data)
}
export async function searchBankTypeAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchBanksQuerySchema = z.object({
    id: z.string(),
  })
  const { id } = searchBanksQuerySchema.parse(request.params)
  const searchBankUseCase = makeSearchBankTypeAccountUseCase()

  const data = await searchBankUseCase.execute({
    query: id,
  })

  return reply.status(200).send(data)
}
export async function searchBankTypeAccountOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchBanksQuerySchema = z.object({
    organizationId: z.string(),
  })
  const { organizationId } = searchBanksQuerySchema.parse(request.params)

  const searchBankUseCase = makeSearchBankOrganizationIdsUseCase()

  const data = await searchBankUseCase.execute({
    query: organizationId,
  })

  return reply.status(200).send(data)
}
export async function searchBanksOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchBanksQuerySchema = z.object({
    organizationId: z.string(),
  })
  const { organizationId } = searchBanksQuerySchema.parse(request.params)

  const searchBankUseCase = makeSearchBankOrganizationIdsUseCase()

  const data = await searchBankUseCase.execute({
    query: organizationId,
  })

  return reply.status(200).send(data)
}
