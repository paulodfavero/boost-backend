import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateUserUseCase } from '@/use-cases/factories/make-create-user-use-case'
// import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exist'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUserParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createUserBodySchema = z.object({
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
    // cnpj: z.string().nullish(),
    // cpf: z.string().nullish(),
  })
  const { organizationId } = createUserParamsSchema.parse(request.params)

  const { name, email, image } = createUserBodySchema.parse(request.body)
  try {
    const createUserUseCase = makeCreateUserUseCase()

    const data = await createUserUseCase.execute({
      name,
      email,
      image,
      organizationId,
    })
    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof UserAlreadyExistsError) {
    console.log('%ccreate.ts line:33 err', 'color: #007acc;', err)
    return reply.status(409).send({ message: '❌ User already exists.' })
    // }
    // throw err
  }
}
