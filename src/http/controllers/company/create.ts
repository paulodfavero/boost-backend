import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCompanyUseCase } from '@/use-cases/factories/make-create-company-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCompanyParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createCompanyBodySchema = z.object({
    name: z.string(),
  })
  const { organizationId } = createCompanyParamsSchema.parse(request.params)

  const { name } = createCompanyBodySchema.parse(request.body)
  const createCompanyUseCase = makeCreateCompanyUseCase()

  const data = await createCompanyUseCase.execute({
    name,
    organizationId,
  })

  // Invalidar cache de empresas após criação
  invalidateCache('companies')

  return reply.status(201).send(data)
}
