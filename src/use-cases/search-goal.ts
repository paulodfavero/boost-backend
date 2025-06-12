import { GoalsRepository } from '@/repositories/goals-repository'

interface SearchGoalUseCaseRequest {
  organizationId: string
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
