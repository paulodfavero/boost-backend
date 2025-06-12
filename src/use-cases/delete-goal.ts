import { GoalsRepository } from '@/repositories/goals-repository'
import { GoalNotFoundError } from './errors/goal-not-found-error'

interface DeleteGoalUseCaseRequest {
  id: string
}

export class DeleteGoalUseCase {
  constructor(private goalsRepository: GoalsRepository) {}

  async execute({ id }: DeleteGoalUseCaseRequest): Promise<void> {
    const goal = await this.goalsRepository.findById(id)

    if (!goal) {
      throw new GoalNotFoundError()
    }

    await this.goalsRepository.delete(id)
  }
}
