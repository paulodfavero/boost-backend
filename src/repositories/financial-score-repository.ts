export interface FinancialScore {
  id: string
  score: number
  evolution: Array<{
    month: string
    score: number
    highlights: string
  }>
  summary: string
  organizationId: string
  created_at: Date
  updated_at?: Date | null
}

export interface CreateFinancialScoreData {
  score: number
  evolution: Array<{
    month: string
    score: number
    highlights: string
  }>
  summary: string
  organizationId: string
}

export interface UpdateFinancialScoreData {
  score?: number
  evolution?: Array<{
    month: string
    score: number
    highlights: string
  }>
  summary?: string
}

export interface FinancialScoreRepository {
  findByOrganizationId(organizationId: string): Promise<FinancialScore | null>
  create(data: CreateFinancialScoreData): Promise<FinancialScore>
  update(
    organizationId: string,
    data: UpdateFinancialScoreData,
  ): Promise<FinancialScore>
}
