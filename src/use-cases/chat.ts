import { format } from 'date-fns'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { CreditsRepository } from '@/repositories/credit-repository'
import { GoalsRepository } from '@/repositories/goals-repository'
import { BanksRepository } from '@/repositories/bank-repository'
import { InvestmentRepository } from '@/repositories/investment-repository'
import { BillsRepository } from '@/repositories/bills-repository'
import { SearchFinancialProjectionSummaryUseCase } from './search-financial-projection-summary'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatUseCaseRequest {
  messages: ChatMessage[]
  organizationId: string
}

interface ChatUseCaseResponse {
  systemPrompt: string
  messages: ChatMessage[]
}

export class ChatUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private expensesRepository: ExpensesRepository,
    private gainsRepository: GainsRepository,
    private creditsRepository: CreditsRepository,
    private goalsRepository: GoalsRepository,
    private banksRepository: BanksRepository,
    private investmentRepository: InvestmentRepository,
    private billsRepository: BillsRepository,
    private searchFinancialProjectionSummaryUseCase: SearchFinancialProjectionSummaryUseCase,
  ) {}

  private formatTransactionsCompact(transactions?: any[]): string {
    if (!transactions || transactions.length === 0) {
      return '[]'
    }

    const formatted = transactions
      .map((transaction) => {
        const date = transaction.purchase_date || transaction.expiration_date
        const dateStr = date ? format(new Date(date), 'dd/MM/yyyy') : ''
        const amount = transaction.amount / 100 // Converter de centavos
        const category = transaction.category || ''
        const description = transaction.description || ''

        return `{data:'${dateStr}',valor:${amount},categoria:'${category}',nome:'${description}'}`
      })
      .join(',')

    return `[${formatted}]`
  }

  private formatGoalsCompact(goals?: any[]): string {
    if (!goals || goals.length === 0) {
      return '{}'
    }

    const formatted = goals
      .map((goal) => {
        const limit = goal.amount / 100
        const current = goal.currentAmount / 100
        const category = goal.description || ''
        const name = goal.name || ''

        return `meta_${category
          .replace(/\s+/g, '_')
          .toLowerCase()}:{limite:${limit},atual:${current},nome:'${name}'}`
      })
      .join('\n')

    return formatted
  }

  private formatCreditCardsCompact(creditCardList?: any[]): string {
    if (!creditCardList || creditCardList.length === 0) {
      return '[]'
    }

    const formatted = creditCardList
      .map((creditCard) => {
        let creditData = null
        try {
          creditData = creditCard.credit_data
            ? JSON.parse(creditCard.credit_data)
            : null
        } catch (error) {
          creditData = null
        }

        const bankName = creditCard.bank?.name || 'N/A'
        const level = creditData?.level || 'N/A'
        const dueDate = creditData?.balanceDueDate
          ? format(new Date(creditData.balanceDueDate), 'dd/MM/yyyy')
          : 'N/A'
        const totalLimit = creditData?.creditLimit
          ? creditData.creditLimit / 100
          : 0
        const availableLimit =
          creditData?.disaggregatedCreditLimits &&
          creditData.disaggregatedCreditLimits.length > 0
            ? creditData.disaggregatedCreditLimits[0]?.availableAmount / 100 ||
              0
            : 0

        return `{banco:'${bankName}',nivel:'${level}',vencimento:'${dueDate}',limite_total:${totalLimit},limite_disponivel:${availableLimit}}`
      })
      .join(',')

    return `[${formatted}]`
  }

  private formatBanksCompact(banks?: any[]): string {
    if (!banks || banks.length === 0) {
      return '[]'
    }

    const formatted = banks.map((bank) => `'${bank.name}'`).join(',')
    return `[${formatted}]`
  }

  private formatInvestmentsCompact(investments?: any[]): string {
    if (!investments || investments.length === 0) {
      return '[]'
    }

    const formatted = investments
      .map((investment) => {
        const bankName = investment.bank?.name || 'N/A'
        let investmentData = '{}'
        try {
          investmentData = investment.investments
            ? JSON.stringify(JSON.parse(investment.investments))
            : '{}'
        } catch (error) {
          investmentData = '{}'
        }

        return `{banco:'${bankName}',investimentos:${investmentData}}`
      })
      .join(',')

    return `[${formatted}]`
  }

  private formatBillsCompact(bills?: any[]): string {
    if (!bills || bills.length === 0) {
      return '[]'
    }

    const formatted = bills
      .map((bill) => {
        const expirationDate = bill.expiration_date
          ? format(new Date(bill.expiration_date), 'dd/MM/yyyy')
          : ''
        const amount = bill.amount / 100 // Converter de centavos
        const description = bill.description || ''
        const company = bill.company || ''
        const category = bill.category || ''
        const paid = !!bill.paid
        const active = !!bill.active
        const dayOfMonth = bill.day_of_month || 0

        return `{data_vencimento:'${expirationDate}',valor:${amount},descricao:'${description}',empresa:'${company}',categoria:'${category}',pago:${paid},ativo:${active},dia_mes:${dayOfMonth}}`
      })
      .join(',')

    return `[${formatted}]`
  }

  private formatFinancialProjectionCompact(projection?: any): string {
    if (!projection) {
      return '{}'
    }

    const { summary, monthlyData } = projection

    const summaryStr = `{total_ganhos:${
      summary.totalGains / 100
    },total_despesas:${summary.totalExpenses / 100},total_creditos:${
      summary.totalCredits / 100
    },saldo_total:${summary.totalBalance / 100},periodo_inicio:'${
      summary.period.startMonth
    }',periodo_fim:'${summary.period.endMonth}',meses:${
      summary.period.monthsCount
    }}`

    if (!monthlyData || monthlyData.length === 0) {
      return `{resumo:${summaryStr},mensais:[]}`
    }

    const monthlyStr = monthlyData
      .map((month: any) => {
        return `{mes:'${month.month}',ganhos:${month.gains / 100},despesas:${
          month.expenses / 100
        },creditos:${month.credits / 100},saldo:${
          month.balance / 100
        },transacoes:{g:${month.transactionCount.gains},e:${
          month.transactionCount.expenses
        },c:${month.transactionCount.credits}}}`
      })
      .join(',')

    return `{resumo:${summaryStr},mensais:[${monthlyStr}]}`
  }

  private getFeatureDocumentation(): string {
    return `INFORMAÇÕES SOBRE FUNCIONALIDADES:

📋 CONTAS A PAGAR (Bills):
O que é: Sistema de alertas para contas recorrentes que funciona como lembretes/notificações.

Como funciona:
1. Você cria contas recorrentes (ex: Aluguel, Internet) que serão exibidas mensalmente
2. O sistema gera alertas de contas a vencer automaticamente
3. Quando você marca uma conta como paga, o alerta desaparece
4. Contas ativas são geradas automaticamente para o próximo mês baseado em contas ativas
5. Você pode desativar uma conta para que ela não seja mais gerada mensalmente

Características:
- Cada conta tem: descrição, empresa, categoria, valor, data de vencimento, dia do mês
- Contas podem estar ativas (geradas mensalmente) ou inativas
- Contas podem estar pagas (não aparecem nos alertas) ou não pagas (aparecem como alerta)
- Valores são sempre em centavos (ex: 150000 = R$ 1.500,00)

Diferença importante:
- Bills (Contas a Pagar): São ALERTAS/LEMBRETES de contas a vencer
- Expenses Projection: São PROJEÇÕES financeiras para planejamento futuro

📊 PROJEÇÃO FINANCEIRA:
O que é: Visualização híbrida de projeções financeiras futuras para planejamento.

Como funciona:
1. O sistema agrega todas as projeções de ganhos, despesas e créditos futuros
2. Mostra um resumo consolidado com totais do período
3. Exibe dados mensais detalhados com ganhos, despesas, créditos e saldo por mês
4. Permite visualizar o fluxo de caixa futuro para os próximos meses
5. Útil para planejamento financeiro e tomada de decisões

Características:
- Retorna resumo com: total de ganhos, total de despesas, total de créditos, saldo total
- Dados mensais incluem: ganhos, despesas, créditos, saldo e contagem de transações
- Período padrão: 12 meses a partir do próximo mês
- Valores são sempre em centavos
- Mostra apenas projeções futuras (não inclui transações já passadas)

Uso:
- Planejamento financeiro de médio e longo prazo
- Visualização de fluxo de caixa futuro
- Análise de saldo projetado por mês
- Identificação de meses com saldo negativo projetado`
  }

  private analyzeMessageContext(messages: ChatMessage[]): {
    needsExpenses: boolean
    needsGains: boolean
    needsGoals: boolean
    needsCredits: boolean
    needsCreditCards: boolean
    needsInvestments: boolean
    needsBanks: boolean
    needsBills: boolean
    needsFinancialProjection: boolean
    period: 'current_month' | 'all' | 'specific'
    monthStart?: string
    monthEnd?: string
  } {
    // Get the last user message to analyze
    const lastUserMessage = messages.filter((msg) => msg.role === 'user').pop()

    if (!lastUserMessage) {
      // Default: return all data if no user message
      return {
        needsExpenses: true,
        needsGains: true,
        needsGoals: true,
        needsCredits: true,
        needsCreditCards: true,
        needsInvestments: true,
        needsBanks: true,
        needsBills: true,
        needsFinancialProjection: true,
        period: 'all',
      }
    }

    const message = lastUserMessage.content.toLowerCase()

    // Keywords for different data types
    const expenseKeywords = [
      'despesa',
      'despesas',
      'gasto',
      'gastos',
      'retirada',
      'retiradas',
      'saída',
      'saídas',
      'pagamento',
      'pagamentos',
      'paguei',
      'gastei',
      'expense',
      'expenses',
      'spent',
    ]
    const gainKeywords = [
      'recebimento',
      'recebimentos',
      'recebi',
      'entrada',
      'entradas',
      'ganho',
      'ganhos',
      'boleto',
      'boletos',
      'salário',
      'salarios',
      'receita',
      'receitas',
      'gain',
      'gains',
      'received',
      'income',
    ]
    const creditKeywords = ['cartão', 'crédito', 'fatura', 'credit', 'card']
    const goalKeywords = ['meta', 'controle', 'gastos', 'goal', 'target']
    const investmentKeywords = [
      'investimento',
      'investimentos',
      'investment',
      'investments',
    ]
    const bankKeywords = [
      'banco',
      'bancos',
      'conta',
      'bank',
      'banks',
      'account',
    ]
    const billsKeywords = [
      'conta a pagar',
      'contas a pagar',
      'conta a vencer',
      'contas a vencer',
      'conta recorrente',
      'contas recorrentes',
      'alerta',
      'alertas',
      'bill',
      'bills',
      'vencimento',
      'vencimentos',
      'pagar',
      'pagamento recorrente',
      'pagamentos recorrentes',
      'como funciona contas a pagar',
      'funcionamento contas a pagar',
      'o que é contas a pagar',
      'explicar contas a pagar',
    ]
    const financialProjectionKeywords = [
      'projeção',
      'projeções',
      'projeção financeira',
      'projeções financeiras',
      'projection',
      'projections',
      'financial projection',
      'futuro',
      'futuros',
      'próximos meses',
      'próximo mês',
      'planejamento',
      'planejar',
      'previsão',
      'previsões',
      'forecast',
      'forecasting',
      'como funciona',
      'funcionamento',
      'o que é',
      'explicar',
    ]

    // Check for period indicators
    const currentMonthKeywords = [
      'mês atual',
      'mes atual',
      'este mês',
      'esse mês',
      'mês corrente',
      'mes corrente',
      'current month',
      'this month',
    ]
    const specificMonthKeywords = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ]

    // Determine period
    let period: 'current_month' | 'all' | 'specific' = 'all'
    let monthStart: string | undefined
    let monthEnd: string | undefined

    if (currentMonthKeywords.some((keyword) => message.includes(keyword))) {
      period = 'current_month'
      const currentDate = new Date()
      monthStart = format(currentDate, 'yyyy/MM')
      monthEnd = format(currentDate, 'yyyy/MM')
    } else if (
      specificMonthKeywords.some((keyword) => message.includes(keyword))
    ) {
      // Could implement specific month parsing here if needed
      period = 'all'
    } else {
      // Infer current month for specific questions about recent transactions
      // If asking about a specific person, amount, or transaction type without mentioning a period,
      // assume they mean current month
      const hasSpecificQuestion =
        message.includes('qual') ||
        message.includes('quanto') ||
        message.includes('quais') ||
        message.includes('what') ||
        message.includes('how much') ||
        message.includes('which')

      const hasPersonName = /(do|da|de)\s+\w+/i.test(message)
      const hasSpecificType =
        expenseKeywords.some((k) => message.includes(k)) ||
        gainKeywords.some((k) => message.includes(k)) ||
        message.includes('tiago') ||
        message.includes('boleto')

      if (hasSpecificQuestion && (hasPersonName || hasSpecificType)) {
        period = 'current_month'
        const currentDate = new Date()
        monthStart = format(currentDate, 'yyyy/MM')
        monthEnd = format(currentDate, 'yyyy/MM')
      }
    }

    // Determine which data types are needed
    const hasExpenseKeywords = expenseKeywords.some((keyword) =>
      message.includes(keyword),
    )
    const hasCreditKeywords = creditKeywords.some((keyword) =>
      message.includes(keyword),
    )

    // Expenses: detect when asking about expenses or credits
    const needsExpenses = hasExpenseKeywords || hasCreditKeywords

    // Credits: detect when asking about credits, OR when asking about expenses in current month
    // (because "retirada" could be either expense or credit transaction)
    const needsCredits =
      hasCreditKeywords || (hasExpenseKeywords && period === 'current_month')

    const needsGains = gainKeywords.some((keyword) => message.includes(keyword))
    const needsCreditCards = hasCreditKeywords
    const needsGoals = goalKeywords.some((keyword) => message.includes(keyword))
    const needsInvestments = investmentKeywords.some((keyword) =>
      message.includes(keyword),
    )
    const needsBanks = bankKeywords.some((keyword) => message.includes(keyword))
    const needsBills = billsKeywords.some((keyword) =>
      message.includes(keyword),
    )
    const needsFinancialProjection = financialProjectionKeywords.some(
      (keyword) => message.includes(keyword),
    )

    // If no specific data type is detected, return all (fallback)
    const hasSpecificDataRequest =
      needsExpenses ||
      needsGains ||
      needsCredits ||
      needsCreditCards ||
      needsGoals ||
      needsInvestments ||
      needsBanks ||
      needsBills ||
      needsFinancialProjection

    if (!hasSpecificDataRequest) {
      return {
        needsExpenses: true,
        needsGains: true,
        needsGoals: true,
        needsCredits: true,
        needsCreditCards: true,
        needsInvestments: true,
        needsBanks: true,
        needsBills: true,
        needsFinancialProjection: true,
        period: 'all',
      }
    }

    return {
      needsExpenses,
      needsGains,
      needsGoals,
      needsCredits,
      needsCreditCards,
      needsInvestments,
      needsBanks,
      needsBills,
      needsFinancialProjection,
      period,
      monthStart,
      monthEnd,
    }
  }

  async execute({
    messages,
    organizationId,
  }: ChatUseCaseRequest): Promise<ChatUseCaseResponse> {
    // Analisar contexto da mensagem para otimizar consultas
    const context = this.analyzeMessageContext(messages)

    // Buscar apenas dados necessários baseado no contexto
    const promises: Array<{ key: string; promise: Promise<any> }> = [
      {
        key: 'organization',
        promise: this.organizationsRepository.findById(organizationId),
      },
    ]

    // Helper function to get date range
    const getDateRange = () => {
      if (
        context.period === 'current_month' &&
        context.monthStart &&
        context.monthEnd
      ) {
        return { monthStart: context.monthStart, monthEnd: context.monthEnd }
      } else {
        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
        const currentDate = new Date()
        return {
          monthStart: format(twoYearsAgo, 'yyyy/MM'),
          monthEnd: format(currentDate, 'yyyy/MM'),
        }
      }
    }

    if (context.needsExpenses) {
      const { monthStart, monthEnd } = getDateRange()
      promises.push({
        key: 'expenses',
        promise: this.expensesRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      })
    }

    if (context.needsGains) {
      const { monthStart, monthEnd } = getDateRange()
      promises.push({
        key: 'gains',
        promise: this.gainsRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      })
    }

    if (context.needsBanks) {
      promises.push({
        key: 'banks',
        promise: this.banksRepository.findByOrganizationId(organizationId),
      })
    }

    if (context.needsGoals) {
      promises.push({
        key: 'goals',
        promise: this.goalsRepository.findByOrganizationId(organizationId),
      })
    }

    if (context.needsCredits) {
      const { monthStart, monthEnd } = getDateRange()
      promises.push({
        key: 'credits',
        promise: this.creditsRepository.searchMany(
          organizationId,
          undefined, // date
          undefined, // bankId
          monthStart,
          monthEnd,
        ),
      })
    }

    if (context.needsCreditCards) {
      promises.push({
        key: 'creditCards',
        promise: this.creditsRepository.searchCardList(organizationId),
      })
    }

    if (context.needsInvestments) {
      promises.push({
        key: 'investments',
        promise: this.investmentRepository.findByOrganizationId(organizationId),
      })
    }

    if (context.needsBills) {
      const { monthStart } = getDateRange()
      // Extrair mês e ano para buscar bills
      const month = monthStart ? monthStart.split('/')[1] : undefined
      const year = monthStart ? monthStart.split('/')[0] : undefined
      promises.push({
        key: 'bills',
        promise: this.billsRepository.searchMany(
          organizationId,
          month,
          year,
          false, // Apenas contas não pagas por padrão
        ),
      })
    }

    if (context.needsFinancialProjection) {
      promises.push({
        key: 'financialProjection',
        promise: this.searchFinancialProjectionSummaryUseCase.execute({
          organizationId,
          months: 12, // Padrão de 12 meses
          startMonth: context.monthStart, // Usar o mês do contexto se disponível
        }),
      })
    }

    const results = await Promise.all(promises.map((p) => p.promise))
    const resultsMap = new Map(
      promises.map((p, index) => [p.key, results[index]]),
    )

    const organization = resultsMap.get('organization')
    const expensesTransactions = resultsMap.get('expenses')
    const gainsTransactions = resultsMap.get('gains')
    const banks = resultsMap.get('banks')
    const goals = resultsMap.get('goals')
    const creditTransactions = resultsMap.get('credits')
    const creditCardList = resultsMap.get('creditCards')
    const investments = resultsMap.get('investments')
    const bills = resultsMap.get('bills')
    const financialProjection = resultsMap.get('financialProjection')

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    // System prompt ultra curto
    const systemPrompt: ChatMessage = {
      role: 'system',
      content:
        'Você é a Boost IA. Responda de forma objetiva e consistente, apenas com base nos dados enviados pelo usuário. Não peça permissões, não ofereça explicações adicionais, não mude de opinião entre respostas. Escreva em português do Brasil usando markdown simples.\n\nIMPORTANTE: Você NUNCA deve inventar motivos, emoções ou justificativas.',
    }

    // Pegar a última mensagem do usuário
    const lastUserMessage = messages.filter((msg) => msg.role === 'user').pop()
    const userQuestion = lastUserMessage?.content || ''

    // Construir dados compactos em formato [dados]...[/dados]
    const dataParts: string[] = []

    // Data atual
    dataParts.push(`data_atual:'${format(new Date(), 'dd/MM/yyyy')}'`)

    // Despesas
    if (context.needsExpenses && expensesTransactions) {
      dataParts.push(
        `despesas=${this.formatTransactionsCompact(expensesTransactions)}`,
      )
    }

    // Recebimentos
    if (context.needsGains && gainsTransactions) {
      dataParts.push(
        `recebimentos=${this.formatTransactionsCompact(gainsTransactions)}`,
      )
    }

    // Gastos no cartão de crédito
    if (context.needsCredits && creditTransactions) {
      dataParts.push(
        `gastos_cartao=${this.formatTransactionsCompact(creditTransactions)}`,
      )
    }

    // Cartões de crédito
    if (context.needsCreditCards && creditCardList) {
      dataParts.push(`cartoes=${this.formatCreditCardsCompact(creditCardList)}`)
    }

    // Metas/Controle de gastos
    if (context.needsGoals && goals) {
      const goalsCompact = this.formatGoalsCompact(goals)
      if (goalsCompact !== '{}') {
        dataParts.push(goalsCompact)
      }
    }

    // Bancos
    if (context.needsBanks && banks) {
      dataParts.push(`bancos=${this.formatBanksCompact(banks)}`)
    }

    // Investimentos
    if (context.needsInvestments && investments) {
      dataParts.push(
        `investimentos=${this.formatInvestmentsCompact(investments)}`,
      )
    }

    // Contas a Pagar
    if (context.needsBills && bills) {
      dataParts.push(`contas_pagar=${this.formatBillsCompact(bills)}`)
    }

    // Projeção Financeira
    if (context.needsFinancialProjection && financialProjection) {
      dataParts.push(
        `projecao_financeira=${this.formatFinancialProjectionCompact(
          financialProjection,
        )}`,
      )
    }

    // Adicionar documentação das funcionalidades se necessário
    if (context.needsBills || context.needsFinancialProjection) {
      const documentation = this.getFeatureDocumentation()
      dataParts.push(
        `documentacao_funcionalidades='${documentation.replace(/'/g, "\\'")}'`,
      )
    }

    // Adicionar a pergunta do usuário
    dataParts.push(`pergunta='${userQuestion.replace(/'/g, "\\'")}'`)

    // Criar mensagem user com dados compactos
    const dataMessage: ChatMessage = {
      role: 'user',
      content: `[dados]\n${dataParts.join('\n')}\n[/dados]`,
    }

    // Filtrar mensagens: remover mensagens de assistant de onboarding
    // Regra: remover qualquer assistant que venha ANTES da primeira mensagem de user
    const filteredMessages: ChatMessage[] = []
    let foundFirstUser = false

    for (const msg of messages) {
      // Se for mensagem de user, marcar que encontramos a primeira
      if (msg.role === 'user') {
        foundFirstUser = true
        // Substituir a última mensagem user pela versão com dados
        if (msg === lastUserMessage) {
          filteredMessages.push(dataMessage)
        } else {
          filteredMessages.push(msg)
        }
        continue
      }

      // Se for mensagem de assistant ANTES da primeira mensagem de user, é onboarding → REMOVER
      if (msg.role === 'assistant' && !foundFirstUser) {
        continue // Ignorar mensagens de onboarding
      }

      // Mensagens de assistant DEPOIS da primeira mensagem de user são respostas reais → MANTER
      if (msg.role === 'assistant' && foundFirstUser) {
        filteredMessages.push(msg)
        continue
      }

      // Mensagens de system não devem vir do frontend, mas se vierem, manter
      if (msg.role === 'system') {
        filteredMessages.push(msg)
      }
    }

    // Se não encontrou nenhuma mensagem user no histórico, adicionar a mensagem com dados
    if (!foundFirstUser) {
      filteredMessages.push(dataMessage)
    }

    // Retornar o prompt montado para o frontend chamar a OpenAI
    return {
      systemPrompt: systemPrompt.content,
      messages: filteredMessages,
    }
  }
}
