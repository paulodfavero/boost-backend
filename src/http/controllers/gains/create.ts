import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateGainUseCase } from '@/use-cases/factories/make-create-gain-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createGymBodySchema = z.array(
    z.object({
      expirationDate: z.string(),
      purchaseDate: z.string().nullish(),
      balanceCloseDate: z.string().nullish(),
      description: z.string(),
      bankTransactionId: z.string().nullish(),
      company: z.string(),
      category: z.string().nullish(),
      amount: z.number(),
      typePayment: z.string(),
      operationType: z.string().nullish(),
      paymentData: z.string().nullish(),
      paid: z.boolean(),
      installmentCurrent: z.number().nullish(),
      installmentTotalPayment: z.number().nullish(),
      bankId: z.string().nullish(),
      bankTypeAccountId: z.string().nullish(),
      merchant: z
        .object({
          businessName: z.string().nullish(),
          cnpj: z.string().nullish(),
          name: z.string().nullish(),
          cnae: z.string().nullish(),
        })
        .nullish(),
    }),
  )

  const { organizationId } = createCheckInParamsSchema.parse(request.params)

  const reqBody = createGymBodySchema.parse(request.body)

  try {
    const createGainUseCase = makeCreateGainUseCase()
    const data = await createGainUseCase.execute({
      organizationId,
      reqBody,
    })

    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof UserAlreadyExistsError) {
    return reply.status(409).send({ message: err })
    // }
    // throw err
  }
}
