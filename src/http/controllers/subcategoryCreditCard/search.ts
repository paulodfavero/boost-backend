import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-subcategory-use-case'

let cachedData: any = null
export async function searchMany(request: FastifyRequest, res: FastifyReply) {
  if (cachedData) {
    res.header('Cache-Control', 'public, max-age=31536000')
    return res.status(200).send(cachedData)
  }
  const searchSubcategory = makeSearchCategoryUseCase()

  const data = await searchSubcategory.execute()

  cachedData = data

  res.header('Cache-Control', 'public, max-age=31536000')

  return res.status(200).send(data)
}
