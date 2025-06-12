export interface Goal {
  id: string
  name: string
  description: string
  amount: number
  currentAmount: number
  period: string
  initiation_date: string
  expiration_date: string
  organizationId: string
  created_at: Date
  updated_at: Date
}

export interface CreateGoalData {
  name: string
  description: string
  amount: number
  currentAmount: number
  period: string
  initiation_date: string
  organizationId: string
}

export interface UpdateGoalData {
  name?: string
  description?: string
  amount?: number
  currentAmount?: number
  period?: string
  initiation_date?: string
}

export interface GoalsRepository {
  create(data: CreateGoalData): Promise<Goal>
  findById(id: string): Promise<Goal | null>
  findByOrganizationId(organizationId: string): Promise<Goal[]>
  update(id: string, data: UpdateGoalData): Promise<Goal>
  delete(id: string): Promise<void>
}
