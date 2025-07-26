import { GoalsRepository } from '@/repositories/goals-repository'
import { GoalNotFoundError } from './errors/goal-not-found-error'

interface UpdateGoalUseCaseRequest {
  id: string
  name?: string
  description?: string
  amount?: number
  currentAmount?: number
  initiation_date?: string
  expiration_date?: string
}

interface GoalResponse {
  id: string
  name: string
  description: string
  amount: number
  currentAmount: number
  initiation_date?: string
  expiration_date?: string
  organizationId?: string
  created_at?: Date
  updated_at?: Date
}

export class UpdateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    id,
    name,
    description,
    amount,
    currentAmount,
    initiation_date,
    expiration_date,
  }: UpdateGoalUseCaseRequest): Promise<GoalResponse> {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFoundError()
    }

    const updatedGoal = await this.goalsRepository.update(id, {
      name,
      description,
      amount,
      currentAmount,
      initiation_date,
      expiration_date,
    })

    return updatedGoal
  }
}
