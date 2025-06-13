import { GoalsRepository } from '@/repositories/goals-repository'
import { GoalNotFoundError } from './errors/goal-not-found-error'

interface UpdateGoalUseCaseRequest {
  id: string
  name?: string
  description?: string
  amount?: string
  period?: string
  initiationDate?: Date
  updatedAt?: Date
}

interface GoalResponse {
  id: string
  name: string
  description: string
  amount: string
  period: string
  initiationDate: Date
  updatedAt: Date
}

export class UpdateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    id,
    name,
    description,
    amount,
    period,
    initiationDate,
  }: UpdateGoalUseCaseRequest): Promise<GoalResponse> {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFoundError()
    }

    const updatedGoal = await this.goalsRepository.update(id, {
      name,
      description,
      amount,
      period,
      initiation_date: initiationDate,
    })

    return updatedGoal
  }
}
