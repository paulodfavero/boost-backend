import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchCompanyUseCase } from '@/use-cases/factories/make-search-company-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchCompaniesQuerySchema = z.object({
    a: z.string(),
  })

  const { a } = searchCompaniesQuerySchema.parse(request.query)
  const searchCompanyUseCase = makeSearchCompanyUseCase()

  const data = await searchCompanyUseCase.execute({
    query: a,
  })

  return reply.status(200).send(data)
}
