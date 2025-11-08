import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchRecurrentGainsUseCase } from '@/use-cases/factories/make-search-recurrent-gains-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchRecurrentGainsQuerySchema = z.object({
    a: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })

  const { a, bankId, isSamePersonTransfer } =
    searchRecurrentGainsQuerySchema.parse(request.query)

  try {
    const searchRecurrentGainsUseCase = makeSearchRecurrentGainsUseCase()
    const data = await searchRecurrentGainsUseCase.execute({
      organizationId: a,
      bankId: bankId || undefined,
      isSamePersonTransfer: isSamePersonTransfer || false,
    })

    return reply.status(200).send(data)
  } catch (err) {
    return reply.status(409).send({ message: err })
  }
}
