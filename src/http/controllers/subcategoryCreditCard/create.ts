import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateSubcategoryUseCase } from '@/use-cases/factories/make-create-subcategory-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createSubsubcategoryBodySchema = z.object({
    id: z.string(),
    description: z.string(),
    descriptionTranslated: z.string(),
    categoryId: z.string(),
    parentDescription: z.string(),
  })

  const {
    description,
    descriptionTranslated,
    id,
    categoryId,
    parentDescription,
  } = createSubsubcategoryBodySchema.parse(request.body)
  try {
    const createSubcategoryUseCase = makeCreateSubcategoryUseCase()

    const data = await createSubcategoryUseCase.execute({
      reqBody: [
        {
          id,
          description,
          descriptionTranslated,
          categoryId,
          parentDescription,
        },
      ],
    })

    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof SubsubcategoryAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR TO CREATE SUBCATEGORY ${err}`,
    })
    // }
    // throw err
  }
}
export async function createMany(request: FastifyRequest, reply: FastifyReply) {
  const createSubsubcategoryBodySchema = z.array(
    z.object({
      description: z.string(),
      descriptionTranslated: z.string(),
      id: z.string(),
      categoryId: z.string(),
      parentDescription: z.string(),
    }),
  )

  const reqBody = createSubsubcategoryBodySchema.parse(request.body)

  try {
    const createSubsubcategoryUseCase = makeCreateSubcategoryUseCase()

    const data = await createSubsubcategoryUseCase.execute({
      reqBody,
    })

    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof SubsubcategoryAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR TO CREATE SUBCATEGORY ${err}`,
    })
    // }
    // throw err
  }
}
