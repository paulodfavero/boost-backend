import { GoalsRepository } from '@/repositories/goals-repository'
import { GoalNotFoundError } from './errors/goal-not-found-error'

interface UpdateGoalUseCaseRequest {
  id: string
  title?: string
  description?: string
  targetAmount?: number
  currentAmount?: number
  deadline?: string
}

interface GoalResponse {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export class UpdateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    id,
    title,
    description,
    targetAmount,
    currentAmount,
    deadline,
  }: UpdateGoalUseCaseRequest): Promise<GoalResponse> {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFoundError()
    }

    const updatedGoal = await this.goalsRepository.update(id, {
      title,
      description,
      targetAmount,
      currentAmount,
      deadline,
    })

    return updatedGoal
  }
}
