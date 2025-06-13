import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateOrganizationUseCase } from '@/use-cases/factories/make-create-organization-use-case'
import { makeCreateUserUseCase } from '@/use-cases/factories/make-create-user-use-case'
// import { OrganizationAlreadyExistsError } from '@/use-cases/errors/organization-already-exist'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createOrganizationBodySchema = z.object({
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
    password: z.string().nullish(),
  })

  const { name, email, image, password } = createOrganizationBodySchema.parse(
    request.body,
  )
  try {
    const createOrganizationUseCase = makeCreateOrganizationUseCase()
    const createUserUseCase = makeCreateUserUseCase()

    const data = await createOrganizationUseCase.execute({
      name,
      email,
      password,
      image,
    })
    if (!data) throw new Error()
    const { organizationId, created } = data
    if (created) return reply.status(201).send(data)
    await createUserUseCase.execute({
      name,
      email,
      password,
      image,
      organizationId,
    })
    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof OrganizationAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR ${err}`,
    })
    // }
    // throw err
  }
}
