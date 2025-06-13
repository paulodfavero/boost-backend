import { FastifyReply, FastifyRequest } from 'fastify'
import { makeSearchCategoryCreditCardUseCase } from '@/use-cases/factories/make-search-category-credit-card-use-case'

let cachedData: any = null

export async function searchMany(request: FastifyRequest, res: FastifyReply) {
  if (cachedData) {
    res.header('Cache-Control', 'public, max-age=31536000')
    return res.status(200).send(cachedData)
  }

  const searchCategoryId = makeSearchCategoryCreditCardUseCase()
  const data = await searchCategoryId.execute()

  cachedData = data

  res.header('Cache-Control', 'public, max-age=31536000')
  return res.status(200).send(data)
}
