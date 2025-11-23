import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchRecurrentBillsUseCase } from '@/use-cases/factories/make-search-recurrent-bills-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchRecurrentBillsQuerySchema = z.object({
    a: z.string(),
    bankId: z.string().nullish(),
  })

  try {
    const { a, bankId } = searchRecurrentBillsQuerySchema.parse(request.query)

    const searchRecurrentBillsUseCase = makeSearchRecurrentBillsUseCase()
    const data = await searchRecurrentBillsUseCase.execute({
      organizationId: a,
      bankId: bankId || undefined,
    })

    return reply.status(200).send(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }
    return reply.status(409).send({ message: err })
  }
}
