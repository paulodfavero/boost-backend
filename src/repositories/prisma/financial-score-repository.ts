import { prisma } from '@/lib/prisma'
import {
  FinancialScoreRepository,
  CreateFinancialScoreData,
  UpdateFinancialScoreData,
} from '../financial-score-repository'

export class PrismaFinancialScoreRepository
  implements FinancialScoreRepository
{
  async findByOrganizationId(organizationId: string) {
    const financialScore = await prisma.financialScore.findUnique({
      where: {
        organizationId,
      },
    })

    if (!financialScore) {
      return null
    }

    return {
      id: financialScore.id,
      score: financialScore.score,
      evolution: financialScore.evolution as Array<{
        month: string
        score: number
        highlights: string
      }>,
      summary: financialScore.summary,
      organizationId: financialScore.organizationId,
      created_at: financialScore.created_at,
      updated_at: financialScore.updated_at,
    }
  }

  async create(data: CreateFinancialScoreData) {
    const financialScore = await prisma.financialScore.create({
      data: {
        score: data.score,
        evolution: data.evolution,
        summary: data.summary,
        organizationId: data.organizationId,
      },
    })

    return {
      id: financialScore.id,
      score: financialScore.score,
      evolution: financialScore.evolution as Array<{
        month: string
        score: number
        highlights: string
      }>,
      summary: financialScore.summary,
      organizationId: financialScore.organizationId,
      created_at: financialScore.created_at,
      updated_at: financialScore.updated_at,
    }
  }

  async update(organizationId: string, data: UpdateFinancialScoreData) {
    const financialScore = await prisma.financialScore.update({
      where: {
        organizationId,
      },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.evolution !== undefined && { evolution: data.evolution }),
        ...(data.summary !== undefined && { summary: data.summary }),
        updated_at: new Date(),
      },
    })

    return {
      id: financialScore.id,
      score: financialScore.score,
      evolution: financialScore.evolution as Array<{
        month: string
        score: number
        highlights: string
      }>,
      summary: financialScore.summary,
      organizationId: financialScore.organizationId,
      created_at: financialScore.created_at,
      updated_at: financialScore.updated_at,
    }
  }
}
