import { GoalsRepository } from '@/repositories/goals-repository'

interface CreateGoalUseCaseRequest {
  name: string
  description: string
  amount: number
  currentAmount: number
  initiation_date: string
  expiration_date: string
  organizationId: string
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

export class CreateGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    name,
    description,
    amount,
    currentAmount,
    initiation_date,
    expiration_date,
    organizationId,
  }: CreateGoalUseCaseRequest): Promise<GoalResponse> {
    const goal = await this.goalsRepository.create({
      name,
      description,
      amount,
      currentAmount,
      initiation_date,
      expiration_date,
      organizationId,
    })

    return goal
  }
}
