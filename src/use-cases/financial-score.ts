import { OpenAI } from 'openai'
import { format, subMonths, lastDayOfMonth } from 'date-fns'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { CreditsRepository } from '@/repositories/credit-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { FinancialScoreRepository } from '@/repositories/financial-score-repository'

interface FinancialScoreUseCaseRequest {
  organizationId: string
}

export class FinancialScoreUseCase {
  private openai: OpenAI

  constructor(
    private organizationsRepository: OrganizationsRepository,
    private expensesRepository: ExpensesRepository,
    private creditsRepository: CreditsRepository,
    private gainsRepository: GainsRepository,
    private financialScoreRepository: FinancialScoreRepository,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  private calcularScore(dados: {
    [key: string]: { [key: string]: number }
  }): number {
    // Média de gastos mensais
    const meses = Object.keys(dados).length
    if (meses === 0) return 0

    let total = 0
    for (const mes in dados) {
      for (const categoria in dados[mes]) {
        total += dados[mes][categoria]
      }
    }
    const media = total / meses

    // Score base: 1000 - (média gastos / fator)
    // Convertendo de centavos para reais (dividir por 100) e ajustando o divisor
    const mediaEmReais = media / 100
    let score = 1000 - mediaEmReais / 10
    if (score < 0) score = 0
    if (score > 1000) score = 1000

    return Math.round(score)
  }

  private isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    )
  }

  private async calculateAndSaveScore(organizationId: string) {
    // Buscar dados da organização
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    // Buscar despesas dos últimos 12 meses anteriores ao mês anterior
    // Exemplo: estamos em 03/11, então pega de 11/2023 até 10/2024 (12 meses completos)
    // O mês atual não deve ser incluído pois ainda não tem todos os gastos e ganhos computados
    const currentDate = new Date()
    const previousMonth = subMonths(currentDate, 1)
    const lastDayOfPreviousMonth = lastDayOfMonth(previousMonth)
    // 12 meses antes do mês anterior (11 meses antes + o próprio mês anterior = 12 meses)
    const firstDayOfTwelveMonthsAgo = subMonths(previousMonth, 11)
    const startDate = format(firstDayOfTwelveMonthsAgo, 'yyyy-MM-01')
    const endDate = format(lastDayOfPreviousMonth, 'yyyy-MM-dd')

    const gainsTransactions = await this.gainsRepository.searchMany(
      organizationId,
      undefined, // date
      undefined, // bankId
      startDate,
      endDate,
    )

    const expensesTransactions = await this.expensesRepository.searchMany(
      organizationId,
      undefined, // date
      undefined, // bankId
      startDate,
      endDate,
    )

    const creditsTransactions = await this.creditsRepository.searchMany(
      organizationId,
      undefined, // date
      undefined, // bankId
      startDate,
      endDate,
    )

    // Se não há despesas nem créditos, retorna mensagem vazia
    if (
      (!expensesTransactions || expensesTransactions.length === 0) &&
      (!creditsTransactions || creditsTransactions.length === 0)
    ) {
      return null
    }

    // Organizar dados por mês e categoria para cálculo do score
    const dadosPorMes: {
      [key: string]: {
        gastos: { [categoria: string]: number }
        ganhos: { [categoria: string]: number }
      }
    } = {}

    // Processar despesas
    expensesTransactions?.forEach((expense: any) => {
      const expenseDateField = expense.expiration_date
      if (!expenseDateField) return

      const expenseDate = new Date(expenseDateField)
      if (isNaN(expenseDate.getTime())) return

      const month = format(expenseDate, 'yyyy-MM')
      const category =
        expense.category || expense.categoryName || 'Sem categoria'
      const amount = expense.amount / 100
      if (!dadosPorMes[month]) {
        dadosPorMes[month] = { gastos: {}, ganhos: {} }
      }
      if (!dadosPorMes[month].gastos[category]) {
        dadosPorMes[month].gastos[category] = 0
      }
      dadosPorMes[month].gastos[category] = Number(
        (dadosPorMes[month].gastos[category] + amount).toFixed(2),
      )
    })

    // Processar ganhos
    gainsTransactions?.forEach((gain: any) => {
      const gainDateField =
        gain.date || gain.payment_date || gain.expiration_date
      if (!gainDateField) return

      const gainDate = new Date(gainDateField)
      if (isNaN(gainDate.getTime())) return

      const month = format(gainDate, 'yyyy-MM')
      const category = gain.category || gain.categoryName || 'Sem categoria'
      const amount = gain.amount / 100
      if (!dadosPorMes[month]) {
        dadosPorMes[month] = { gastos: {}, ganhos: {} }
      }
      if (!dadosPorMes[month].ganhos[category]) {
        dadosPorMes[month].ganhos[category] = 0
      }
      dadosPorMes[month].ganhos[category] = Number(
        (dadosPorMes[month].ganhos[category] + amount).toFixed(2),
      )
    })

    function calcularScore(totalGasto: number, totalGanho: number) {
      if (totalGanho <= 0) return 0
      const ratio = totalGasto / totalGanho
      let score = Math.round(1000 * Math.exp(-1.2 * (ratio - 0.8)))
      if (score < 0) score = 0
      if (score > 1000) score = 1000
      return score
    }

    // Montar dados mensais (apenas meses completos, até o mês anterior)
    const monthlyScores = Object.entries(dadosPorMes).map(([month, data]) => {
      const totalGasto = Number(
        Object.values(data.gastos)
          .reduce((a, b) => a + b, 0)
          .toFixed(2),
      )
      const totalGanho = Number(
        Object.values(data.ganhos)
          .reduce((a, b) => a + b, 0)
          .toFixed(2),
      )
      const score = calcularScore(Number(totalGasto), Number(totalGanho))

      return {
        month,
        totalGasto,
        totalGanho,
        ratio: totalGanho > 0 ? (totalGasto / totalGanho).toFixed(2) : null,
        categories: data.gastos,
        score,
      }
    })

    // Ordenar meses para consistência
    const orderedScores = monthlyScores.sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    )

    // Se tiver somente 1 mês com dados, retornar null e não chamar a API do OpenAI
    if (orderedScores.length <= 1) {
      return null
    }

    const scoreMedio =
      orderedScores.reduce((acc, cur) => acc + cur.score, 0) /
      orderedScores.length

    const userPrompt = {
      role: 'user' as const,
      content: `${organization.name} ${
        organization.email
      } esses são dados do usuário. Não fazer nada com o nome ou email do usuário. Isso é só para controle interno.
      
    Você receberá os dados de ganhos e gastos do usuário já organizados por mês. 
    O score financeiro de cada mês foi calculado com base na relação ganho/gasto, e varia entre 0 e 1000.
    
    Sua tarefa é:
    1. NÃO recalcular os scores. Use apenas os valores fornecidos.
    2. Analise a evolução mês a mês com base no total de ganhos, gastos e scores já calculados.
    3. Gere para cada mês:
       - "score": número informado
       - "highlights": pontos positivos e negativos breves, com base nos totais e categorias daquele mês.
    4. Gere um resumo curto e motivador (máx. 3 frases). Se o score cair de forma consistente, alerte o usuário.
    5. O tom deve ser simples, amigável e próximo (como Nubank/Inter usam).
    
    Dados do usuário (não invente novos valores, use apenas estes):
    ${JSON.stringify(orderedScores, null, 2)}
    
    Score médio: ${Math.round(scoreMedio)}
    
    Responda apenas em formato JSON, sem blocos de código:
    {
      "score": número (entre 0 e 1000),
      "evolution": [
        {
          "month": "YYYY-MM",
          "score": número,
          "highlights": "texto"
        }
      ],
      "summary": "resumo motivador"
    }`,
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `Você é um coach financeiro especializado em ajudar usuários a entender e melhorar sua relação entre ganhos e gastos.`,
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
        temperature: 1,
        messages: [systemPrompt, userPrompt],
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Resposta vazia da IA')

      let jsonContent = content.trim()
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```json\s*|^```\s*|\s*```$/g, '')
      }

      const parsed = JSON.parse(jsonContent)
      parsed.evolution = parsed.evolution.map((m: any) => ({
        ...m,
        score: Math.max(0, Math.min(1000, m.score)),
      }))

      // Salvar ou atualizar no banco
      const existingScore =
        await this.financialScoreRepository.findByOrganizationId(organizationId)

      if (existingScore) {
        await this.financialScoreRepository.update(organizationId, {
          score: parsed.score,
          evolution: parsed.evolution,
          summary: parsed.summary,
        })
      } else {
        await this.financialScoreRepository.create({
          organizationId,
          score: parsed.score,
          evolution: parsed.evolution,
          summary: parsed.summary,
        })
      }

      return parsed
    } catch (error) {
      console.error('Erro ao criar financial-score completion:', error)
      throw new Error('Erro interno do servidor')
    }
  }

  async execute({ organizationId }: FinancialScoreUseCaseRequest) {
    // Verificar se existe registro no banco
    const existingScore =
      await this.financialScoreRepository.findByOrganizationId(organizationId)

    const currentDate = new Date()

    // Se existe registro e é do mês atual → retornar cache
    if (
      existingScore &&
      this.isSameMonth(existingScore.created_at, currentDate)
    ) {
      return {
        score: existingScore.score,
        evolution: existingScore.evolution,
        summary: existingScore.summary,
      }
    }

    // Se não existe ou é de mês anterior → recalcular
    return await this.calculateAndSaveScore(organizationId)
  }
}
