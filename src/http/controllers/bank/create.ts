import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { 
  makeCreateBankUseCase, 
  makeCreateBankTypeAccountUseCase 
} from '@/use-cases/factories/make-create-bank-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBankParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createBankBodySchema = z.object({
    name: z.string(),
    itemId: z.string(),
    primaryColor: z.string(),
    institutionUrl: z.string(),
    type: z.string(),
    imageUrl: z.string(),
    hasMFA: z.boolean(),
    products: z.array(z.string().nullish()),
    status: z.string(),
    lastUpdatedAt: z.string(),
  })
  const { organizationId } = createBankParamsSchema.parse(request.params)

  const {
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products,
    status,
    lastUpdatedAt,
  } = createBankBodySchema.parse(request.body)
  const createBankUseCase = makeCreateBankUseCase()

  const data = await createBankUseCase.execute({
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products: products ? products : [],
    status,
    lastUpdatedAt,
    organizationId,
  })

  return reply.status(201).send(data)
}

export async function createBankTypeAccount(request: FastifyRequest, reply: FastifyReply) {
  const headers = await request.headers
  const itemId = headers.itemid

  const createBankTypeAccountParamsSchema = z.object({
    organizationId: z.string(),    
  })

  const createBankAccountTypeBodySchema = z.object({
    type: z.string(),
    subtype: z.string(),
    name: z.string(),
    accountId: z.string(),
    marketingName: z.string().nullable(),
    owner: z.string(),
    balance: z.number(),
    currencyCode: z.string(),
    number: z.string(),
    bankData: z.string().nullable(),
    creditData: z.string().nullable(),
    taxNumber: z.string().nullable(),
  })
  const { organizationId } = await createBankTypeAccountParamsSchema.parse(request.params)
  const {
    type,
    subtype,
    name,
    accountId,
    marketingName,
    owner,
    balance,
    currencyCode,
    number,
    bankData,
    creditData,
    taxNumber,
  } = createBankAccountTypeBodySchema.parse(request.body)

  const createBankTypeAccountUseCase = makeCreateBankTypeAccountUseCase()

  try {
    const data = await createBankTypeAccountUseCase.execute({
      type,
      subtype,
      name,
      accountId,
      marketingName,
      owner,
      balance,
      currencyCode,
      itemId,
      number,
      bankData: bankData || '',
      creditData: creditData || '',
      taxNumber: taxNumber || '',
      organizationId
    } as any)

    return reply.status(201).send(data)
  } catch (error: any) {
    const errorStatus = error?.statusCode || 500
    console.log('%csrc/http/controllers/bank/create.ts:119 error', 'color: #007acc;', error);
    return reply.status(errorStatus).send(error)
  }
}
