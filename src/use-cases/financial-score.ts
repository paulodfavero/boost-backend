import { OpenAI } from 'openai'
import { format, subMonths } from 'date-fns'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { CreditsRepository } from '@/repositories/credit-repository'

interface FinancialScoreUseCaseRequest {
  organizationId: string
}

export class FinancialScoreUseCase {
  private openai: OpenAI

  constructor(
    private organizationsRepository: OrganizationsRepository,
    private expensesRepository: ExpensesRepository,
    private creditsRepository: CreditsRepository,
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

  async execute({ organizationId }: FinancialScoreUseCaseRequest) {
    // Buscar dados da organização
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    // Buscar despesas dos últimos 12 meses (sem filtro de mês)
    const currentDate = new Date()
    const twelveMonthsAgo = subMonths(currentDate, 12)
    const startDate = format(twelveMonthsAgo, 'yyyy-MM-dd')
    const endDate = format(currentDate, 'yyyy-MM-dd')

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
    const dadosPorMes: { [key: string]: { [key: string]: number } } = {}

    // Processar despesas
    expensesTransactions?.forEach((expense: any) => {
      const expenseDateField = expense.expiration_date

      if (expenseDateField) {
        const expenseDate = new Date(expenseDateField)

        if (!isNaN(expenseDate.getTime())) {
          const month = format(expenseDate, 'yyyy-MM')
          const category =
            expense.category || expense.categoryName || 'Sem categoria'

          if (!dadosPorMes[month]) {
            dadosPorMes[month] = {}
          }
          if (!dadosPorMes[month][category]) {
            dadosPorMes[month][category] = 0
          }
          dadosPorMes[month][category] += expense.amount
        } else {
          console.log('Data inválida para expense:', expenseDateField)
        }
      } else {
        console.log('Expense sem data:', expense)
      }
    })

    // Calcular score usando a fórmula especificada
    const score = this.calcularScore(dadosPorMes)

    const monthlyScores = Object.entries(dadosPorMes).map(
      ([month, categories]) => {
        const total = Object.values(categories).reduce(
          (acc, val) => acc + val,
          0,
        )
        const mediaEmReais = total / 100
        let score = 1000 - mediaEmReais / 10
        if (score < 0) score = 0
        if (score > 1000) score = 1000
        return {
          month,
          total,
          categories,
          score: Math.round(score),
        }
      },
    )
    const userPrompt = {
      role: 'user' as const,
      content: `Você receberá os dados de gastos do usuário já organizados por mês (totais e categorias). 
O score financeiro já foi calculado usando a fórmula: 1000 - (média de gastos mensais em reais / 10).

Sua tarefa é:

1. Usar os dados fornecidos sem inventar valores adicionais.  
2. Analisar a evolução dos gastos mês a mês com base nos totais.  
3. Usar o score calculado (${score}) como referência inicial.  
4. Para cada mês, crie:
   - "score": número ajustado de acordo com os gastos em relação ao mês anterior
   - "highlights": pontos positivos e negativos, com base nos totais e categorias daquele mês.  
5. Gerar um resumo curto e motivador (máx. 3 frases). Se o score cair de forma consistente, alerte o usuário.  
6. O tom deve ser simples, amigável e próximo (como Nubank/Inter usam).

Dados do usuário (não invente novos valores, use apenas estes):
${JSON.stringify(monthlyScores, null, 2)}

Score calculado (base): ${score}

Responda apenas em formato JSON:
{
  "score": ${score},
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
      content: `Você é um coach financeiro especializado em análise de gastos e pontuação financeira.`,
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        temperature: 0.4,
        messages: [systemPrompt, userPrompt],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Resposta vazia da IA')
      }

      // Extrair JSON do conteúdo, removendo blocos de código markdown se existirem
      let jsonContent = content.trim()

      // Se o conteúdo está dentro de blocos de código markdown, extrair apenas o JSON
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      return JSON.parse(jsonContent)
    } catch (error) {
      console.error('Erro ao criar financial-score completion:', error)
      throw new Error('Erro interno do servidor')
    }
  }
}
