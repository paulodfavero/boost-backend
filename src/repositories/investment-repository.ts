export interface Investment {
  id: string
  created_at: Date
  updated_at: Date | null
  investments: string
  organizationId: string
  bankId: string | null
}

export interface CreateInvestmentData {
  investments: string
  organizationId: string
  bankId?: string
}

export interface UpdateInvestmentData {
  investments?: string
  bankId?: string
}

export interface InvestmentRepository {
  create(data: CreateInvestmentData): Promise<Investment>
  findById(id: string): Promise<Investment | null>
  findByOrganizationId(organizationId: string): Promise<Investment[]>
  findByBankId(bankId: string): Promise<Investment | null>
  update(id: string, data: UpdateInvestmentData): Promise<Investment>
  delete(id: string): Promise<void>
}
