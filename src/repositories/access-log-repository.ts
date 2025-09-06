import { Prisma, AccessLog } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface AccessLogRepository {
  create(data: Prisma.AccessLogCreateInput): Promise<AccessLog>
  findByOrganizationId(organizationId: string): Promise<AccessLog[]>
  findById(id: string): Promise<AccessLog | null>
  delete(id: string): Promise<void>
}

export class PrismaAccessLogRepository implements AccessLogRepository {
  async create(data: Prisma.AccessLogCreateInput): Promise<AccessLog> {
    const accessLog = await prisma.accessLog.create({
      data,
    })

    return accessLog
  }

  async findByOrganizationId(organizationId: string): Promise<AccessLog[]> {
    const accessLogs = await prisma.accessLog.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return accessLogs
  }

  async findById(id: string): Promise<AccessLog | null> {
    const accessLog = await prisma.accessLog.findUnique({
      where: {
        id,
      },
    })

    return accessLog
  }

  async delete(id: string): Promise<void> {
    await prisma.accessLog.delete({
      where: {
        id,
      },
    })
  }
}
