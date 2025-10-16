import { prisma } from '@/lib/prisma'

import { UsersRepository } from '../user-repository'

interface CreateUserUseCaseResponse {
  name: string
  email: string
  image?: string
  organizationId: string
}
export class PrismaUsersRepository implements UsersRepository {
  async create(data: CreateUserUseCaseResponse) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.user.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
  // async findById(id: string) {
  //   const user = await prisma.user.findUnique({
  //     where: {
  //       id,
  //     },
  //   })

  //   return user
  // }
}
