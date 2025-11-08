import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchRecurrentCreditsUseCase } from '@/use-cases/factories/make-search-recurrent-credits-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchRecurrentCreditsQuerySchema = z.object({
    a: z.string(),
    bankId: z.string().nullish(),
  })

  const { a, bankId } = searchRecurrentCreditsQuerySchema.parse(request.query)

  try {
    const searchRecurrentCreditsUseCase = makeSearchRecurrentCreditsUseCase()
    const data = await searchRecurrentCreditsUseCase.execute({
      organizationId: a,
      bankId: bankId || undefined,
    })

    return reply.status(200).send(data)
  } catch (err) {
    return reply.status(409).send({ message: err })
  }
}
