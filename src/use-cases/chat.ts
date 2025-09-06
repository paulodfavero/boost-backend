import { OpenAI } from 'openai'
import { format } from 'date-fns'
import { categories } from '@/data/categories'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { CreditsRepository } from '@/repositories/credit-repository'
import { GoalsRepository } from '@/repositories/goals-repository'
import { BanksRepository } from '@/repositories/bank-repository'
import { InvestmentRepository } from '@/repositories/investment-repository'
// import { cache } from '@/lib/cache' // Temporariamente desabilitado para debug

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatUseCaseRequest {
  messages: ChatMessage[]
  organizationId: string
}

export class ChatUseCase {
  private openai: OpenAI

  constructor(
    private organizationsRepository: OrganizationsRepository,
    private expensesRepository: ExpensesRepository,
    private gainsRepository: GainsRepository,
    private creditsRepository: CreditsRepository,
    private goalsRepository: GoalsRepository,
    private banksRepository: BanksRepository,
    private investmentRepository: InvestmentRepository,
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

  private formatCreditCards(creditCardList?: any[]): string {
    if (!creditCardList || creditCardList.length === 0) {
      return 'Nenhum cartão de crédito cadastrado'
    }

    return creditCardList
      .map((creditCard) => {
        // Parse do credit_data se for string JSON
        let creditData = null
        try {
          creditData = creditCard.credit_data
            ? JSON.parse(creditCard.credit_data)
            : null
        } catch (error) {
          creditData = null
        }

        const availableLimit =
          creditData?.disaggregatedCreditLimits &&
          creditData.disaggregatedCreditLimits.length > 0
            ? `limite de crédito disponível: ${this.priceFormatter(
                creditData.disaggregatedCreditLimits[0]?.availableAmount || 0,
              )}`
            : ''

        return `nome banco: ${creditCard.bank?.name || 'N/A'}, 
        nível: ${creditData?.level || 'N/A'}, 
        vencimento: ${
          creditData?.balanceDueDate
            ? format(new Date(creditData.balanceDueDate), 'dd/MM/yyyy')
            : 'N/A'
        }, 
        limite de crédito total: ${
          creditData?.creditLimit
            ? this.priceFormatter(creditData.creditLimit)
            : 'N/A'
        }, 
        ${availableLimit}`
      })
      .join('\n')
  }

  private formatTransactions(transactions?: any[]): string {
    if (!transactions || transactions.length === 0) {
      return 'Nenhuma transação encontrada'
    }

    const total = transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    )

    const formattedTransactions = transactions
      .map((transaction) => {
        const date = transaction.purchase_date || transaction.expiration_date
        return `data compra: ${
          date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A'
        }, valor: ${this.priceFormatter(transaction.amount)}, categoria: ${
          transaction.category || 'N/A'
        }, nome da transação: ${transaction.description};`
      })
      .join('\n')

    return `${formattedTransactions}\nTotal: ${this.priceFormatter(total)}`
  }

  private formatGoals(goals?: any[]): string {
    if (!goals || goals.length === 0) {
      return 'Nenhum planejamento de gastos cadastrado'
    }

    return goals
      .map((goal) => {
        return `meta de gasto: ${this.priceFormatter(
          goal.amount,
        )}; categoria: ${goal.description}; nome da meta: ${
          goal.name
        }; valor atual: ${this.priceFormatter(
          goal.currentAmount,
        )}; data vencimento: ${format(
          new Date(goal.expiration_date),
          'dd/MM/yyyy',
        )}`
      })
      .join('\n')
  }

  private formatInvestments(investments?: any[]): string {
    if (!investments || investments.length === 0) {
      return 'Nenhum investimento cadastrado'
    }

    return investments
      .map((investment) => {
        try {
          const investmentData = JSON.parse(investment.investments)
          return `banco: ${
            investment.bank?.name || 'N/A'
          }, investimentos: ${JSON.stringify(investmentData)}`
        } catch (error) {
          return `banco: ${investment.bank?.name || 'N/A'}, investimentos: ${
            investment.investments
          }`
        }
      })
      .join('\n')
  }

  private formatBanks(banks?: any[]): string {
    if (!banks || banks.length === 0) {
      return 'Nenhum banco conectado'
    }

    return banks
      .map((bank) => {
        return `${bank.name}`
      })
      .join('\n')
  }

  private analyzeMessageContext(messages: ChatMessage[]): {
    needsExpenses: boolean
    needsGains: boolean
    needsGoals: boolean
    needsCredits: boolean
    needsCreditCards: boolean
    needsInvestments: boolean
    needsBanks: boolean
  } {
    // Always fetch all user data to provide comprehensive context
    // This ensures the AI has access to all user information regardless of the question
    return {
      needsExpenses: true,
      needsGains: true,
      needsGoals: true,
      needsCredits: true,
      needsCreditCards: true,
      needsInvestments: true,
      needsBanks: true,
    }
  }

  async execute({ messages, organizationId }: ChatUseCaseRequest) {
    // Analisar contexto da mensagem para otimizar consultas
    const context = this.analyzeMessageContext(messages)

    // Temporariamente desabilitar cache para debug
    // Sempre buscar dados frescos do banco

    // Buscar apenas dados necessários baseado no contexto
    const promises: Promise<any>[] = [
      this.organizationsRepository.findById(organizationId), // Sempre necessário
    ]

    if (context.needsExpenses) {
      // Get expenses from the last 2 years to provide comprehensive context
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const currentDate = new Date()

      const monthStart = format(twoYearsAgo, 'yyyy/MM')
      const monthEnd = format(currentDate, 'yyyy/MM')

      promises.push(
        this.expensesRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      )
    }

    if (context.needsGains) {
      // Get gains from the last 2 years to provide comprehensive context
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const currentDate = new Date()

      const monthStart = format(twoYearsAgo, 'yyyy/MM')
      const monthEnd = format(currentDate, 'yyyy/MM')

      promises.push(
        this.gainsRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      )
    }
    if (context.needsBanks) {
      promises.push(this.banksRepository.findByOrganizationId(organizationId))
    }

    if (context.needsGoals) {
      promises.push(this.goalsRepository.findByOrganizationId(organizationId))
    }

    if (context.needsCredits) {
      // Get credit transactions from the last 2 years to provide comprehensive context
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const currentDate = new Date()

      const monthStart = format(twoYearsAgo, 'yyyy/MM')
      const monthEnd = format(currentDate, 'yyyy/MM')

      promises.push(
        this.creditsRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      )
    }

    if (context.needsCreditCards) {
      promises.push(this.creditsRepository.searchCardList(organizationId))
    }

    if (context.needsInvestments) {
      promises.push(
        this.investmentRepository.findByOrganizationId(organizationId),
      )
    }

    const results = await Promise.all(promises)

    const organization = results[0]
    const expensesTransactions = results[1]
    const gainsTransactions = results[2]
    const banks = results[3]
    const goals = results[4]
    const creditTransactions = results[5]
    const creditCardList = results[6]
    const investments = results[7]

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Você é um assistente especializado da Boost Finance. Sua função é responder perguntas exclusivamente com base nas informações oficiais e disponíveis da Boost Finance. Com linguajar descontraído.
          Regras:

          1. Só responda perguntas relacionadas à Boost Finance.
          2. Se a pergunta estiver fora do escopo da empresa (por exemplo, política, esportes, outras fintechs), responda educadamente que só pode responder sobre a Boost Finance.
          3. Suas respostas devem ser claras, objetivas e adequadas para clientes ou interessados na empresa.
          4. Quando aplicável, use dados reais da plataforma e os serviços oferecidos.
          5. Nunca invente dados. Se não souber a resposta, diga que a informação não está disponível.
          6. Sempre responda em português do Brasil e com markdown.
          7. Não responder como tabela.          
          8. As categorias já vêm do banco central. Não é possível inserir novas para manter o padrão dos bancos. Mas é possível alterar o tipo de categororia para cada transação. Vá na transação, clique em "Editar" e altere o tipo de categoria.
          9. Muito importante: Você não cria nada na Boost Finance. Você é um assistente que responde perguntas sobre a Boost Finance.
          10. Sempre que for falar sobre planos, use o link: https://www.boostfinance.com.br/plans

          **Categorias disponíveis para transações**:
          ${categories.map((cat: any) => `- ${cat.categoryName}`).join('\n')}

          **Dados do usuário**:
          - Nome do usuário: ${organization.name}.
          - Dia atual: ${format(new Date(), 'dd/MM/yyyy')}.
          - Despesas: ${this.formatTransactions(expensesTransactions)}.
          - Recebimentos: ${this.formatTransactions(
            gainsTransactions,
          )}.          
          - Cartão de Crédito do usuário: ${this.formatCreditCards(
            creditCardList,
          )}
          - Gastos no cartão de crédito: ${this.formatTransactions(
            creditTransactions,
          )}.
          - Planejamento dos gastos: ${this.formatGoals(goals)}.
          - Bancos conectados: ${this.formatBanks(banks)}.
          - Investimentos: ${this.formatInvestments(investments)}.

          **Sobre a Boost Finance**:
          - A Boost Finance é uma plataforma de educação e planejamento financeiro pessoal
          - Itens no menu: Dashboard, Recebimentos, Despesas, Cartão de crédito, Planejamento de gastos, Conectar banco.
          - Usuários podem criar seus recebimentos, despesas e gastos no cartão de crédito manualmente, porém devemos induzir ele, de forma inteligente, à conectar seus bancos para que isso seja automático.
          - A conexão com os bancos é feita de forma segura usando o sistema Open Finance - regulamentado pelo Banco Central. Os dados sensíveis são criptografados e ninguém tem acesso.
          - Se for perguntado sobre o campo "Mesma titularidade?": esse campo exibe ou oculta as transações entre bancos do mesmo titular. Exemplo: se usuário tem uma conta no banco Itau e transfere dinheiro para ele mesmo em uma outra conta (Santander por exemplo), essa transação caracteriza-se como sendo da mesma titularidade.
          
          **Bancos**:
          - O usuário pode conectar seus bancos para que as transações sejam exibidas automaticamente.
          - O usuário pode ocultar ou exibir transações específicas, o que altera o valor total exibido, clicando no ícone de olho em cada transação.
          - Transações vindas do Open Finance podem ser editadas (apesar de não recomendado, pois pode afetar a precisão).
          - Na página de conexão com bancos, o usuário pode Atualizar as transações, inserir apelido no banco e remover o banco (ao remover todos os dados daquele banco serão excluídos).

          **Planejamento de gastos**:
          - O usuário pode criar planejamentos com data de início e fim, escolher uma categoria e valor estimado.
          - O sistema mostra visualmente quanto tempo falta e quanto já foi gasto na categoria durante o período planejado.

          **Multibancos**:
          - O usuário pode filtrar as transações por banco.
          - Para isso, deve clicar no cabeçalho onde aparecem as logos dos bancos conectados.

          **Aplicativo móvel**:
          - O app da Boost Finance está em desenvolvimento e será lançado em breve para iOS e Android 📱.

          **Atendimento humano**:
          - Se e somente se o usuário pedir para falar com um atendente humano, informe o WhatsApp: (21) 95936-4718.
          - Nunca exiba esse número sem ser solicitado diretamente.

          **Planos assinatura Boost Finance**:
            - Essencial - Free
              - Pra você que ta começando a controlar sua grana

              - Gratuito
              - Conexão com 1 banco - Open Finance
              - Gerenciamento de Receitas e Despesas
              - Alertas de vencimento de contas
              - Relatório de gastos por categoria
              - Comparação mês a mês no período de 12 meses
            
            - Boost IA - Plus
              - Pra você que precisa entender onde seu dinheiro está
              - R$ 6,90 / mês
              - Conexão com 3 banco - Open Finance
              - Boost IA - Dicas para economizar
              - Gerenciamento de Receitas e Despesas
              - Alertas de vencimento de contas
              - Relatório de gastos por categoria
              - Comparação mês a mês no período de 12 meses
         
          - Boost IA - Pro
            - Pra você que tem muitos bancos e quer ajuda personalizada
            - R$ 14,90 / mês
            - Conexão ilimitada de bancos - Open Finance
            - Chat Boost IA - Respostas rápidas sobre sua vida financeira
            - Boost IA - Dicas para economizar
            - Relatórios mensais com insights de IA
            - Gerenciamento de Receitas e Despesas
            - Alertas de vencimento de contas
            - Relatório de gastos por categoria
            - Comparação mês a mês no período de 12 meses        
        `,
    }
    console.log('systemPrompt', systemPrompt)
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        store: true,
        stream: true,
        temperature: 0.2,
        messages: [systemPrompt, ...messages],
      })

      return stream
    } catch (error) {
      console.error('Erro ao criar chat completion:', error)
      throw new Error('Erro interno do servidor')
    }
  }
}
