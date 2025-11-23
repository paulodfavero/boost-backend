# 📋 API de Contas a Pagar (Bills)

Documentação completa da funcionalidade de **Bills** (Contas a Pagar) - sistema de alertas para contas recorrentes.

---

## 🎯 Visão Geral

A funcionalidade de **Bills** funciona como um sistema de alertas para contas a pagar. O usuário pode:

1. **Criar contas recorrentes** que serão exibidas mensalmente
2. **Receber alertas** de contas a vencer
3. **Marcar como pago** - quando pago, o alerta desaparece
4. **Gerar automaticamente** contas do próximo mês baseado em contas ativas

### Diferença entre Bills e Expenses Projection

- **Expenses Projection**: Projeções financeiras para planejamento (valores projetados)
- **Bills**: Alertas de contas a pagar (funciona como lembretes/notificações)

---

## 📊 Estrutura da Tabela

### Modelo Bill

```typescript
{
  id: string                    // ID único (nanoid)
  created_at: DateTime          // Data de criação
  updated_at: DateTime          // Data de atualização
  description: string           // Descrição da conta (ex: "Aluguel", "Internet")
  company: string               // Nome da empresa/fornecedor
  category: string?             // Categoria (opcional)
  amount: number                // Valor em centavos (ex: 150000 = R$ 1.500,00)
  expiration_date: DateTime     // Data de vencimento
  day_of_month: number          // Dia do mês em que vence (1-31)
  paid: boolean                 // Se foi pago (default: false)
  active: boolean               // Se está ativa para gerar mensalmente (default: true)
  source_transaction_id: string? // ID da transação original (opcional)
  organizationId: string         // ID da organização
}
```

---

## 🔌 Endpoints Disponíveis

### 1. **GET `/bills`** - Buscar Contas

Busca contas com filtros opcionais.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `organizationId` | string | ✅ Sim | ID da organização |
| `month` | string | ❌ Não | Mês (formato: "01" a "12") |
| `year` | string | ❌ Não | Ano (formato: "2024") |
| `paid` | string | ❌ Não | Filtrar por status: "true" ou "false" |

#### Exemplo de Request

```http
GET /bills?organizationId=abc123&month=11&year=2024&paid=false
```

#### Resposta de Sucesso (200)

```json
[
  {
    "id": "xyz789",
    "created_at": "2024-11-23T13:15:44.000Z",
    "updated_at": "2024-11-23T13:15:44.000Z",
    "description": "Aluguel",
    "company": "Imobiliária ABC",
    "category": "Moradia",
    "amount": 150000,
    "expiration_date": "2024-11-15T00:00:00.000Z",
    "day_of_month": 15,
    "paid": false,
    "active": true,
    "source_transaction_id": null,
    "organizationId": "abc123"
  },
  {
    "id": "xyz790",
    "created_at": "2024-11-23T13:15:44.000Z",
    "updated_at": "2024-11-23T13:15:44.000Z",
    "description": "Internet",
    "company": "Provedor XYZ",
    "category": "Serviços",
    "amount": 9900,
    "expiration_date": "2024-11-10T00:00:00.000Z",
    "day_of_month": 10,
    "paid": true,
    "active": true,
    "source_transaction_id": "trans_123",
    "organizationId": "abc123"
  }
]
```

#### Casos de Uso

- **Buscar contas do mês atual não pagas**: `GET /bills?organizationId=abc123&month=11&year=2024&paid=false`
- **Buscar todas as contas**: `GET /bills?organizationId=abc123`
- **Buscar contas pagas**: `GET /bills?organizationId=abc123&paid=true`

---

### 2. **POST `/bills/:organizationId`** - Criar Conta(s)

Cria uma conta e automaticamente gera instâncias para os próximos N meses.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `organizationId` | string | ✅ Sim | ID da organização |

#### Request Body

```typescript
{
  description: string           // Descrição da conta
  company: string               // Nome da empresa
  category?: string | null      // Categoria (opcional)
  amount: number                // Valor em centavos
  expirationDate: string         // Data de vencimento inicial (ISO string)
  dayOfMonth: number            // Dia do mês (1-31)
  sourceTransactionId?: string | null  // ID da transação original (opcional)
}
```

#### Exemplo de Request

```http
POST /bills/abc123
Content-Type: application/json

{
  "description": "Aluguel",
  "company": "Imobiliária ABC",
  "category": "Moradia",
  "amount": 150000,
  "expirationDate": "2024-11-15T00:00:00.000Z",
  "dayOfMonth": 15,
  "sourceTransactionId": "trans_123"
}
```

#### Resposta de Sucesso (201)

Retorna a conta criada:

```json
{
  "id": "bill_001",
  "expiration_date": "2024-11-15T00:00:00.000Z",
  "description": "Aluguel",
  "company": "Imobiliária ABC",
  "amount": 150000,
  "paid": false,
  "active": true,
  "day_of_month": 15
}
```

#### Comportamento

- Cria **apenas UMA conta** (a primeira)
- A conta criada tem `active: true` e `paid: false` por padrão
- Ajusta automaticamente o dia do mês se for maior que o último dia do mês (ex: 31 em fevereiro vira 28/29)
- **Use `generate-monthly` para gerar as próximas contas mensalmente**

---

### 3. **PUT `/bills/:billId`** - Atualizar Conta

Atualiza uma conta específica.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `billId` | string | ✅ Sim | ID da conta |

#### Request Body (todos os campos são opcionais)

```typescript
{
  description?: string
  company?: string
  category?: string | null
  amount?: number
  expirationDate?: string
  dayOfMonth?: number        // 1-31
  active?: boolean
}
```

#### Exemplo de Request

```http
PUT /bills/bill_001
Content-Type: application/json

{
  "amount": 160000,
  "description": "Aluguel atualizado"
}
```

#### Resposta de Sucesso (200)

```json
{
  "id": "bill_001",
  "updated_at": "2024-11-23T14:30:00.000Z",
  "amount": 160000,
  "description": "Aluguel atualizado",
  // ... outros campos
}
```

#### Casos de Uso

- Atualizar valor de uma conta
- Mudar a descrição
- Desativar uma conta (`active: false`) para que ela não seja mais gerada mensalmente

---

### 4. **PATCH `/bills/:billId/mark-as-paid`** - Marcar como Pago

Marca uma conta como paga. **Quando pago, o alerta desaparece do frontend.**

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `billId` | string | ✅ Sim | ID da conta |

#### Exemplo de Request

```http
PATCH /bills/bill_001/mark-as-paid
```

#### Resposta de Sucesso (200)

```json
{
  "id": "bill_001",
  "paid": true,
  "updated_at": "2024-11-23T14:30:00.000Z",
  // ... outros campos
}
```

#### Comportamento no Frontend

- Quando `paid: true`, a conta **não deve aparecer** nos alertas
- Filtrar por `paid: false` para mostrar apenas contas não pagas
- A conta continua no banco, apenas não aparece mais como alerta

---

### 5. **DELETE `/bills/:billId`** - Deletar Conta

Remove uma conta permanentemente.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `billId` | string | ✅ Sim | ID da conta |

#### Exemplo de Request

```http
DELETE /bills/bill_001
```

#### Resposta de Sucesso (204)

Sem conteúdo (No Content)

---

### 6. **POST `/bills/:organizationId/generate-monthly`** - Gerar Contas do Mês

Gera automaticamente as contas do próximo mês (ou mês especificado) baseado em todas as contas ativas.

#### Path Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `organizationId` | string | ✅ Sim | ID da organização |

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `targetMonth` | string | ❌ Não | Mês alvo no formato "YYYY-MM" (padrão: próximo mês) |

#### Exemplo de Request

```http
POST /bills/abc123/generate-monthly?targetMonth=2024-12
```

#### Resposta de Sucesso (200)

Retorna array com as contas geradas:

```json
[
  {
    "id": "bill_new_001",
    "expiration_date": "2024-12-15T00:00:00.000Z",
    "description": "Aluguel",
    "company": "Imobiliária ABC",
    "amount": 150000,
    "paid": false,
    "active": true
  }
  // ... outras contas geradas
]
```

#### Comportamento

- Busca todas as contas com `active: true`
- Para cada conta ativa, verifica se já existe uma conta para o mês alvo
- Se não existir, cria uma nova conta para aquele mês
- **Não duplica** contas que já existem

#### Casos de Uso

- **Cron Job**: Executar mensalmente para gerar automaticamente as contas do próximo mês
- **Botão no Frontend**: Permitir que o usuário gere manualmente as contas do próximo mês

---

## 🔄 Fluxo de Funcionamento

### 1. Criação Inicial de Conta

```
Usuário cria conta → POST /bills/:organizationId
  ↓
Sistema cria UMA conta (active: true, paid: false)
  ↓
Conta fica disponível para alertas
```

### 2. Exibição de Alertas

```
Frontend busca contas → GET /bills?paid=false&month=11&year=2024
  ↓
Exibe apenas contas não pagas do mês atual
  ↓
Mostra alerta: "Conta X vence em Y dias"
```

### 3. Marcar como Pago

```
Usuário marca como pago → PATCH /bills/:billId/mark-as-paid
  ↓
paid: true
  ↓
Conta desaparece dos alertas (não aparece mais em GET com paid=false)
```

### 4. Geração Mensal Automática

```
Cron job executa mensalmente → POST /bills/:organizationId/generate-monthly
  ↓
Busca todas as contas com active: true
  ↓
Para cada conta ativa, verifica se já existe conta para o próximo mês
  ↓
Se não existir, cria uma nova instância para o próximo mês
  ↓
Contas do próximo mês aparecem nos alertas
```

---

## 💡 Casos de Uso no Frontend

### 1. Tela de Alertas de Contas a Vencer

```typescript
// Buscar contas não pagas do mês atual
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const response = await fetch(
  `/bills?organizationId=${orgId}&month=${currentMonth}&year=${currentYear}&paid=false`
)
const bills = await response.json()

// Filtrar contas que ainda não venceram
const upcomingBills = bills.filter(bill => 
  new Date(bill.expiration_date) >= new Date()
)

// Exibir alertas
upcomingBills.forEach(bill => {
  const daysUntilDue = calculateDaysUntil(bill.expiration_date)
  showAlert(`${bill.description} - ${bill.company} vence em ${daysUntilDue} dias`)
})
```

### 2. Marcar como Pago

```typescript
const markAsPaid = async (billId: string) => {
  await fetch(`/bills/${billId}/mark-as-paid`, {
    method: 'PATCH'
  })
  
  // Atualizar lista (a conta não aparecerá mais)
  refreshBillsList()
}
```

### 3. Criar Nova Conta Recorrente

```typescript
const createBill = async (billData: {
  description: string
  company: string
  amount: number
  dayOfMonth: number
}) => {
  const response = await fetch(`/bills/${organizationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...billData,
      expirationDate: new Date().toISOString() // Data inicial
    })
  })
  
  const createdBill = await response.json()
  // Uma conta foi criada. Use generate-monthly para gerar as próximas.
}
```

### 4. Desativar Conta (para não gerar mais)

```typescript
const deactivateBill = async (billId: string) => {
  await fetch(`/bills/${billId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: false })
  })
  
  // Esta conta não será mais gerada mensalmente
}
```

---

## 🎨 Sugestões de UI/UX

### Tela de Alertas

```
┌─────────────────────────────────────┐
│  📋 Contas a Pagar - Novembro 2024 │
├─────────────────────────────────────┤
│  ⚠️  Aluguel - Imobiliária ABC      │
│     Vence em 5 dias                 │
│     R$ 1.500,00                     │
│     [✓ Marcar como pago]            │
├─────────────────────────────────────┤
│  ⚠️  Internet - Provedor XYZ        │
│     Vence em 12 dias                │
│     R$ 99,00                         │
│     [✓ Marcar como pago]            │
└─────────────────────────────────────┘
```

### Filtros Sugeridos

- Mostrar apenas não pagas (`paid=false`)
- Filtrar por mês/ano
- Ordenar por data de vencimento
- Mostrar contas vencidas em vermelho

---

## 🔗 Integração com OpenAI (Futuro)

A ideia é que o OpenAI analise as transações do usuário e sugira contas recorrentes para salvar. Exemplo de fluxo:

1. OpenAI analisa transações e identifica padrões recorrentes
2. Retorna sugestões: "Detectamos um pagamento recorrente de R$ 150,00 para 'Imobiliária ABC' todo dia 15"
3. Usuário escolhe quais sugestões salvar
4. Frontend chama `POST /bills/:organizationId` para cada sugestão escolhida

---

## 📝 Notas Importantes

1. **Valores**: Sempre em **centavos** (150000 = R$ 1.500,00)
2. **Datas**: Formato ISO 8601 (ex: "2024-11-15T00:00:00.000Z")
3. **Criar conta**: Cria apenas **UMA conta** (a primeira)
4. **Geração mensal**: Use `generate-monthly` mensalmente (cron job) para gerar as próximas
5. **Dia do Mês**: Ajustado automaticamente se for maior que o último dia do mês
6. **Contas Pagas**: Não aparecem nos alertas, mas continuam no banco
7. **Contas Inativas**: Não são geradas mensalmente (`active: false`)

---

## 🚀 Próximos Passos Sugeridos

1. **Cron Job**: Configurar execução mensal de `generate-monthly`
2. **Notificações Push**: Alertar usuário sobre contas a vencer
3. **Integração OpenAI**: Sugerir contas baseado em transações
4. **Histórico**: Mostrar histórico de contas pagas
5. **Estatísticas**: Dashboard com total de contas do mês, valor total, etc.

---

## ❓ Dúvidas Frequentes

**Q: O que acontece se eu marcar uma conta como paga?**  
A: Ela desaparece dos alertas, mas continua no banco. Você pode buscar contas pagas usando `paid=true`.

**Q: Como desativar uma conta para que ela não seja mais gerada?**  
A: Use `PUT /bills/:billId` com `active: false`.

**Q: Como gerar contas para vários meses?**  
A: Use `POST /bills/:organizationId/generate-monthly` mensalmente (recomendado via cron job) ou chame manualmente quando necessário.

**Q: Como gerar contas do próximo mês manualmente?**  
A: Use `POST /bills/:organizationId/generate-monthly`.

---

**Documentação criada em:** 23/11/2024  
**Versão da API:** 1.0.0

