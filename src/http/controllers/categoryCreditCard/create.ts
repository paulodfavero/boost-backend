import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCategoryCreditCardUseCase } from '@/use-cases/factories/make-create-category-credit-card-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryBodySchema = z.object({
    description: z.string(),
    descriptionTranslated: z.string(),
    id: z.string(),
  })

  const { description, descriptionTranslated, id } =
    createCategoryBodySchema.parse(request.body)
  try {
    const createCategoryUseCase = makeCreateCategoryCreditCardUseCase()

    const data = await createCategoryUseCase.execute({
      reqBody: [
        {
          description,
          descriptionTranslated,
          id,
        },
      ],
    })

    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof CategoryAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR TO CREATE CATEGORY ${err}`,
    })
    // }
    // throw err
  }
}
export async function createMany(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryBodySchema = z.array(
    z.object({
      description: z.string(),
      descriptionTranslated: z.string(),
      id: z.string(),
    }),
  )

  const reqBody = createCategoryBodySchema.parse(request.body)

  try {
    const createCategoryUseCase = makeCreateCategoryCreditCardUseCase()

    const data = await createCategoryUseCase.execute({
      reqBody,
    })

    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof CategoryAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR TO CREATE CATEGORY ${err}`,
    })
    // }
    // throw err
  }
}
