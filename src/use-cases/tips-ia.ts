import { OpenAI } from 'openai'
import { format, subMonths } from 'date-fns'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { CreditsRepository } from '@/repositories/credit-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { BanksTypeAccountRepository } from '@/repositories/bank-repository'

interface TipsIaUseCaseRequest {
  organizationId: string
}

export class TipsIaUseCase {
  private openai: OpenAI

  constructor(
    private organizationsRepository: OrganizationsRepository,
    private expensesRepository: ExpensesRepository,
    private creditsRepository: CreditsRepository,
    private gainsRepository: GainsRepository,
    private banksTypeAccountRepository: BanksTypeAccountRepository,
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

  private priceFormatterFromCents(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100)
  }

  private randomChoice(array: any[]): any {
    return array[Math.floor(Math.random() * array.length)]
  }

  async execute({ organizationId }: TipsIaUseCaseRequest) {
    // Buscar dados da organização
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    if (!organization) {
      throw new Error('Organização não encontrada')
    }

    const banks = await this.banksTypeAccountRepository.findByOrganizationId(
      organizationId,
    )

    // Calcular a soma do balance apenas dos bancos (type === 'BANK')
    const bankAccounts = banks.filter((bank: any) => bank.type === 'BANK')

    const totalBalance = bankAccounts.reduce((sum: number, bank: any) => {
      return sum + (bank.balance || 0)
    }, 0)

    // Buscar despesas do mês atual
    const currentDate = new Date()
    const monthStart = format(subMonths(currentDate, 3), 'yyyy-MM-dd') // Primeiro dia do mês
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
    const gainsTransactions = await this.gainsRepository.searchMany(
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
          `data: ${
            item.purchase_date
              ? format(new Date(item.purchase_date), 'dd/MM/yyyy')
              : 'N/A'
          }; 
          categoria: ${item.category}; 
          nome da transação: ${item.description}; 
          valor: ${this.priceFormatter(item.amount)};
          `,
      ) || []

    const creditsData =
      creditsTransactions?.map(
        (item: any) =>
          `data: ${
            item.purchase_date
              ? format(new Date(item.purchase_date), 'dd/MM/yyyy')
              : 'N/A'
          }; 
          categoria: ${item.category}; 
          nome da transação: ${item.description}; 
          valor: ${this.priceFormatter(item.amount)};
          `,
      ) || []

    const gainsData =
      gainsTransactions?.map(
        (item: any) =>
          `data: ${
            item.purchase_date
              ? format(new Date(item.purchase_date), 'dd/MM/yyyy')
              : 'N/A'
          }; 
          categoria: ${item.category}; 
          nome da transação: ${item.description}; 
          valor: ${this.priceFormatter(item.amount)};
          `,
      ) || []

    const allTransactions = [...expensesData, ...creditsData]
    // console.log('allTransactions', allTransactions)
    const systemPrompt = {
      role: 'system' as const,
      content: `Você é um assistente financeiro inteligente.`,
    }
    const themes = [
      'Economia prática',
      'Padrão invisível',
      'Oportunidade de rendimento',
      'Ajuste de comportamento',
      'Prevenção de imprevistos',
      'Otimização de contas fixas',
      'Uso inteligente de benefícios bancários',
      'Planejamento de longo prazo',
    ]

    const selectedTheme = this.randomChoice(themes)

    const userPrompt = {
      role: 'user' as const,
      content: `${organization.name} ${
        organization.email
      } esses são dados do usuário. Não fazer nada com o nome ou email do usuário. Isso é só para controle interno.
      
    Você é a Boost IA, assistente financeira do aplicativo Boost Finance.  
Sua missão é gerar **uma dica de economia prática, criativa e personalizada** com base nos dados financeiros reais do usuário (gastos e ganhos recentes).

A dica deve:
1. Mostrar **como o usuário pode economizar dinheiro sem necessariamente cortar conforto ou prazer**. Não é necessário mencionar sem abrir mão do conforto, prazer ou estilo.
2. Propor **uma ação realista e imediata**, com base em seus padrões de consumo, disponível no mercado brasileiro.
3. Ser **específica e estratégica**, e não apenas sugerir “gastar menos” ou “guardar mais”, ser imediatamente aplicável e ser estratégica e específica, mas sempre verdadeira.
4. Pode envolver:
   - trocar um tipo de serviço por outro mais eficiente,
   - ajustar o momento de compra,
   - usar benefícios bancários ou cashback,
   - consolidar despesas em um plano melhor,
   - antecipar pagamentos para evitar juros,
   - mudar o método de pagamento para gerar vantagem.
5. Se possível, **quantifique o impacto** (quanto ele economiza ou evita gastar).
6. O tom deve ser **inteligente, amigável e provocador**, como quem dá um conselho de bastidor — e não uma lição.
7. Nunca inventar produtos financeiros, porcentagens de cashback, taxas, limites, planos, serviços, tarifas ou vantagens que não existam comprovadamente no Brasil.
    - Se sugerir cashback, usar apenas: "um cartão que ofereça cashback", sem citar porcentagens.
    - Se houver necessidade de valor numérico, somente use números derivados das transações reais do usuário, nunca números externos ou supostos.

A resposta deve conter **apenas o texto final da dica**, sem explicações adicionais.
---
Exemplo 1:
> Você costuma pagar três serviços de streaming separados. Unir planos familiares pode economizar cerca de R$38 por mês sem perder acesso.

Exemplo 2:
> Sua fatura do cartão vence poucos dias após o pagamento. Alterar a data para 10 dias depois aumenta o fôlego e reduz risco de juros.

Exemplo 3:
> Os gastos com transporte variam bastante. Fazer um combo mensal no app que você mais usa sairia 15% mais barato no fim do mês.
---
- Transações:${allTransactions.join('; ')}
- Ganhos: ${gainsData.join('; ')}
- Saldo total: ${this.priceFormatter(totalBalance * 100)}
- Tipo de dica a gerar: **${selectedTheme}**  

### Saída esperada:
⚠️ A resposta deve ter **no máximo 180 caracteres**, em **uma frase única** no formato:
texto da dica
Nada mais além disso.
`,
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-mini',
        temperature: 1,
        messages: [systemPrompt, userPrompt],
      })
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('')
      }

      return { message: content }
    } catch (error) {
      console.error('Erro ao criar tips-ia completion:', error)
      throw new Error('Erro interno do servidor')
    }
  }
}
