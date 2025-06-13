import { PrismaClient } from '@prisma/client'
import { addMonths, addDays } from 'date-fns'
import {
  GoalsRepository,
  CreateGoalData,
  UpdateGoalData,
} from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
  constructor(private prisma: PrismaClient) {}

  private calculateExpirationDate(initiationDate: Date, period: string): Date {
    switch (period.toLowerCase()) {
      case 'day':
        return addDays(initiationDate, 1)
      case 'week':
        return addDays(initiationDate, 7)
      case 'month':
        return addMonths(initiationDate, 1)
      case 'year':
        return addMonths(initiationDate, 12)
      default:
        return addMonths(initiationDate, 1) // default to one month
    }
  }

  async create(data: CreateGoalData) {
    const initiationDate = new Date(data.initiation_date)
    const expirationDate = this.calculateExpirationDate(
      initiationDate,
      data.period,
    )

    const goal = await this.prisma.goals.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        currentAmount: data.currentAmount,
        period: data.period,
        initiation_date: initiationDate,
        expiration_date: expirationDate,
        organizationId: data.organizationId,
      },
    })

    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      amount: goal.amount,
      currentAmount: goal.currentAmount,
      period: goal.period,
      initiation_date: goal.initiation_date.toISOString(),
      expiration_date: goal.expiration_date.toISOString(),
      organizationId: goal.organizationId,
      created_at: goal.created_at,
      updated_at: goal.updated_at || goal.created_at,
    }
  }

  async findById(id: string) {
    const goal = await this.prisma.goals.findUnique({
      where: {
        id,
      },
    })

    if (!goal) {
      return null
    }

    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      amount: goal.amount,
      currentAmount: goal.currentAmount,
      period: goal.period,
      initiation_date: goal.initiation_date.toISOString(),
      expiration_date: goal.expiration_date.toISOString(),
      organizationId: goal.organizationId,
      created_at: goal.created_at,
      updated_at: goal.updated_at || goal.created_at,
    }
  }

  async findByOrganizationId(organizationId: string) {
    const goals = await this.prisma.goals.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      description: goal.description,
      amount: goal.amount,
      currentAmount: goal.currentAmount,
      period: goal.period,
      initiation_date: goal.initiation_date.toISOString(),
      expiration_date: goal.expiration_date.toISOString(),
      organizationId: goal.organizationId,
      created_at: goal.created_at,
      updated_at: goal.updated_at || goal.created_at,
    }))
  }

  async update(id: string, data: UpdateGoalData) {
    const goal = await this.prisma.goals.findUnique({
      where: { id },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const initiationDate = data.initiation_date
      ? new Date(data.initiation_date)
      : goal.initiation_date
    const period = data.period || goal.period
    const expirationDate = this.calculateExpirationDate(initiationDate, period)

    const updatedGoal = await this.prisma.goals.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        currentAmount: data.currentAmount,
        period: data.period,
        initiation_date: data.initiation_date
          ? new Date(data.initiation_date)
          : undefined,
        expiration_date: expirationDate,
        updated_at: new Date(),
      },
    })

    return {
      id: updatedGoal.id,
      name: updatedGoal.name,
      description: updatedGoal.description,
      amount: updatedGoal.amount,
      currentAmount: updatedGoal.currentAmount,
      period: updatedGoal.period,
      initiation_date: updatedGoal.initiation_date.toISOString(),
      expiration_date: updatedGoal.expiration_date.toISOString(),
      organizationId: updatedGoal.organizationId,
      created_at: updatedGoal.created_at,
      updated_at: updatedGoal.updated_at || updatedGoal.created_at,
    }
  }

  async delete(id: string) {
    await this.prisma.goals.delete({
      where: {
        id,
      },
    })
  }
}
