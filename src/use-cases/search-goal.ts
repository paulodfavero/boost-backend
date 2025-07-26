import { GoalsRepository } from '@/repositories/goals-repository'

interface SearchGoalUseCaseRequest {
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

export class SearchGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({
    organizationId,
  }: SearchGoalUseCaseRequest): Promise<GoalResponse[]> {
    const goals = await this.goalsRepository.findByOrganizationId(
      organizationId,
    )
    return goals
  }
}
