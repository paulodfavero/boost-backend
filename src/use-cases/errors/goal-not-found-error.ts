export class GoalNotFoundError extends Error {
  constructor() {
    super('Goal not found.')
  }
}
