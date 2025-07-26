import { PrismaClient } from '@prisma/client'
import {
  GoalsRepository,
  CreateGoalData,
  UpdateGoalData,
} from '../goals-repository'

export class PrismaGoalsRepository implements GoalsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateGoalData) {
    const initiationDate = new Date(data.initiation_date)
    const expirationDate = new Date(data.expiration_date)

    const goal = await this.prisma.goals.create({
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        currentAmount: data.currentAmount,
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

    const updatedGoal = await this.prisma.goals.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        amount: data.amount,
        currentAmount: data.currentAmount,
        initiation_date: data.initiation_date
          ? new Date(data.initiation_date)
          : undefined,
        expiration_date: data.expiration_date
          ? new Date(data.expiration_date)
          : undefined,
        updated_at: new Date(),
      },
    })

    return {
      id: updatedGoal.id,
      name: updatedGoal.name,
      description: updatedGoal.description,
      amount: updatedGoal.amount,
      currentAmount: updatedGoal.currentAmount,
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
