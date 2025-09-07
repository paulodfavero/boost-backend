import { OpenAI } from 'openai'
import { format } from 'date-fns'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { CreditsRepository } from '@/repositories/credit-repository'

interface TipsIaUseCaseRequest {
  organizationId: string
}

export class TipsIaUseCase {
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

  private priceFormatter(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100)
  }

  async execute({ organizationId }: TipsIaUseCaseRequest) {
    // Buscar dados da organização
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    // Buscar despesas do mês atual
    const currentDate = new Date()
    const monthStart = format(currentDate, 'yyyy-MM-01') // Primeiro dia do mês
    const monthEnd = format(currentDate, 'yyyy-MM-dd') // Último dia do mês atual

    const expensesTransactions = await this.expensesRepository.searchMany(
      organizationId,
      undefined, // date
      undefined, // bankId
      monthStart,
      monthEnd,
    )
    const creditsTransactions = await this.creditsRepository.searchMany(
      organizationId,
      undefined, // date
      undefined, // bankId
      monthStart,
      monthEnd,
    )

    // Se não há despesas nem créditos, retorna mensagem vazia
    if (
      (!expensesTransactions || expensesTransactions.length === 0) &&
      (!creditsTransactions || creditsTransactions.length === 0)
    ) {
      return null
    }

    const expensesData =
      expensesTransactions?.map(
        (item: any) =>
          `despesa: ${item.description}; categoria: ${
            item.category
          }; valor: ${this.priceFormatter(item.amount)}`,
      ) || []

    const creditsData =
      creditsTransactions?.map(
        (item: any) =>
          `crédito: ${item.description}; categoria: ${
            item.category
          }; valor: ${this.priceFormatter(item.amount)}`,
      ) || []

    const allTransactions = [...expensesData, ...creditsData]

    const systemPrompt = {
      role: 'system' as const,
      content: `Você é um assistente financeiro inteligente.`,
    }

    const userPrompt = {
      role: 'user' as const,
      content: `Receberá uma lista de transações do usuário (com descrição, categoria e valor). Sua tarefa é gerar **uma única dica de economia personalizada, curta e clara (máx. 2 frases)**.\n\nRegras:\n- Escolha apenas o gasto mais relevante, priorizando o de MAIOR valor ou que se repete mais vezes.\n- Ignore valores pequenos ou menos impactantes.\n- Ignore transações de categorias de **investimentos**.\n- Seja assertivo e direto, evitando frases genéricas.\n- O tom deve ser motivador e amigável, mas objetivo.\n- Sugira apenas **uma ação prática** (ex.: 'cancele', 'reduza', 'substitua').\n- Escreva em português do Brasil.\n\nExemplo de saída:\n"Você gastou R$ 344 em delivery este mês 🍔. Reduzindo pela metade, já economiza R$ 170 para guardar."\n\nTransações do usuário:\n ${allTransactions.join(
        '; ',
      )}`,
    }
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        stream: true,
        temperature: 0.4,
        messages: [systemPrompt, userPrompt],
      })

      return stream
    } catch (error) {
      console.error('Erro ao criar tips-ia completion:', error)
      throw new Error('Erro interno do servidor')
    }
  }
}
