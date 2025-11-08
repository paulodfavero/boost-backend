# 📊 API de Projeção Financeira

Documentação dos endpoints para visualização híbrida de projeções financeiras.

---

## 🎯 Endpoints Disponíveis

### 1. GET `/financial-projection/summary`

Retorna resumo consolidado e dados agregados por mês para visualização híbrida.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|------------|-----------|
| `organizationId` | string | ✅ Sim | ID da organização |
| `months` | number | ❌ Não | Quantidade de meses para projetar (padrão: 12) |
| `startMonth` | string | ❌ Não | Mês inicial no formato `'y/MM'` (ex: `'2024/01'`). Se não informado, usa o próximo mês |

#### Exemplo de Request

```http
GET /financial-projection/summary?organizationId=123&months=12&startMonth=2024/02
```

#### Resposta de Sucesso (200)

```json
{
  "summary": {
    "totalGains": 120000,
    "totalExpenses": 80000,
    "totalCredits": 30000,
    "totalBalance": 40000,
    "period": {
      "startMonth": "2024/02",
      "endMonth": "2025/01",
      "monthsCount": 12
    }
  },
  "monthlyData": [
    {
      "month": "2024/02",
      "gains": 10000,
      "expenses": 7000,
      "credits": 2500,
      "balance": 500,
      "transactionCount": {
        "gains": 3,
        "expenses": 5,
        "credits": 2
      }
    },
    {
      "month": "2024/03",
      "gains": 10000,
      "expenses": 7000,
      "credits": 2500,
      "balance": 500,
      "transactionCount": {
        "gains": 3,
        "expenses": 5,
        "credits": 2
      }
    }
  ]
}
```

#### Estrutura da Resposta

**Summary:**
- `totalGains` (number): Total de ganhos em centavos
- `totalExpenses` (number): Total de gastos em centavos
- `totalCredits` (number): Total de créditos em centavos
- `totalBalance` (number): Saldo total em centavos (Ganhos - Gastos - Créditos)
- `period` (object): Informações do período
  - `startMonth` (string): Mês inicial no formato `'y/MM'`
  - `endMonth` (string): Mês final no formato `'y/MM'`
  - `monthsCount` (number): Quantidade de meses

**MonthlyData:**
- `month` (string): Mês no formato `'y/MM'`
- `gains` (number): Total de ganhos do mês em centavos
- `expenses` (number): Total de gastos do mês em centavos
- `credits` (number): Total de créditos do mês em centavos
- `balance` (number): Saldo do mês em centavos (gains - expenses - credits)
- `transactionCount` (object): Contagem de transações
  - `gains` (number): Quantidade de ganhos
  - `expenses` (number): Quantidade de gastos
  - `credits` (number): Quantidade de créditos

---

### 2. GET `/financial-projection/month-details`

Retorna transações detalhadas de um mês específico.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|------------|-----------|
| `organizationId` | string | ✅ Sim | ID da organização |
| `month` | string | ✅ Sim | Mês no formato `'y/MM'` (ex: `'2024/02'`) |

#### Exemplo de Request

```http
GET /financial-projection/month-details?organizationId=123&month=2024/02
```

#### Resposta de Sucesso (200)

```json
{
  "month": "2024/02",
  "expenses": [
    {
      "id": "exp-1",
      "description": "Aluguel",
      "amount": 200000,
      "category": "Moradia",
      "expirationDate": "2024-02-05T00:00:00-03:00",
      "purchaseDate": "2024-02-05T00:00:00-03:00",
      "paid": false,
      "type": "expense",
      "company": "Imobiliária XYZ",
      "typePayment": "recurrent",
      "bank": {
        "id": "bank-1",
        "name": "Banco XYZ",
        "imageUrl": "https://example.com/bank.png"
      },
      "createdAt": "2024-01-15T10:00:00-03:00",
      "updatedAt": "2024-01-15T10:00:00-03:00"
    }
  ],
  "gains": [
    {
      "id": "gain-1",
      "description": "Salário",
      "amount": 500000,
      "category": "Renda",
      "expirationDate": "2024-02-01T00:00:00-03:00",
      "purchaseDate": "2024-02-01T00:00:00-03:00",
      "paid": false,
      "type": "gain",
      "company": "Empresa ABC",
      "typePayment": "recurrent",
      "bank": null,
      "createdAt": "2024-01-15T10:00:00-03:00",
      "updatedAt": "2024-01-15T10:00:00-03:00"
    }
  ],
  "credits": [
    {
      "id": "credit-1",
      "description": "Fatura Cartão",
      "amount": 150000,
      "category": "Cartão de Crédito",
      "expirationDate": "2024-02-10T00:00:00-03:00",
      "purchaseDate": "2024-02-10T00:00:00-03:00",
      "paid": false,
      "type": "credit",
      "company": "Banco XYZ",
      "typePayment": "recurrent",
      "bank": {
        "id": "bank-1",
        "name": "Banco XYZ",
        "imageUrl": null
      },
      "createdAt": "2024-01-15T10:00:00-03:00",
      "updatedAt": "2024-01-15T10:00:00-03:00"
    }
  ],
  "totals": {
    "gains": 500000,
    "expenses": 200000,
    "credits": 150000,
    "balance": 150000
  }
}
```

#### Estrutura da Resposta

**Transação (expense/gain/credit):**
- `id` (string): ID da transação
- `description` (string): Descrição da transação
- `amount` (number): Valor em centavos
- `category` (string | null): Categoria da transação
- `expirationDate` (string): Data de vencimento no formato ISO 8601 com timezone `-03:00`
- `purchaseDate` (string | null): Data de compra no formato ISO 8601 com timezone `-03:00`
- `paid` (boolean): Indica se a transação foi paga
- `type` (string): Tipo da transação (`"expense"`, `"gain"` ou `"credit"`)
- `company` (string): Nome da empresa/estabelecimento
- `typePayment` (string): Tipo de pagamento (ex: `"recurrent"`)
- `bank` (object | null): Informações do banco
  - `id` (string): ID do banco
  - `name` (string): Nome do banco
  - `imageUrl` (string | null): URL da imagem do banco
- `createdAt` (string): Data de criação no formato ISO 8601 com timezone `-03:00`
- `updatedAt` (string): Data de atualização no formato ISO 8601 com timezone `-03:00`

**Totals:**
- `gains` (number): Total de ganhos do mês em centavos
- `expenses` (number): Total de gastos do mês em centavos
- `credits` (number): Total de créditos do mês em centavos
- `balance` (number): Saldo do mês em centavos (gains - expenses - credits)

---

## 📝 Observações Importantes

### Formato de Datas

- **Mês**: Sempre no formato `'y/MM'` (ex: `'2024/01'`, `'2025/12'`)
- **Datas ISO**: Sempre no formato ISO 8601 com timezone `-03:00` (ex: `'2024-02-05T00:00:00-03:00'`)

### Valores Monetários

- **Sempre em centavos**: Todos os valores são números inteiros representando centavos
- Exemplo: R$ 100,50 = `10050` centavos

### Agregação por Mês

- As projeções são agrupadas pelo campo `month` (formato `'y/MM'`)
- O backend calcula os totais de cada mês automaticamente
- Meses sem projeções são omitidos (não aparecem no array)

### Ordenação

- `monthlyData` vem ordenado cronologicamente (mês mais antigo primeiro)
- Transações dentro de cada tipo (expenses, gains, credits) vêm ordenadas por `expirationDate` (mais recente primeiro)

### Filtros

- Retorna apenas projeções futuras (a partir do mês atual ou próximo)
- Não inclui projeções com `expiration_date` já passado

---

## 🔄 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 409 | Erro (validação, dados inválidos, etc.) |

---

## 💡 Exemplos de Uso

### Exemplo 1: Buscar resumo e dados mensais

```typescript
const response = await fetch(
  `/financial-projection/summary?organizationId=${orgId}&months=12&startMonth=2024/02`
)
const data = await response.json()

// Usar data.summary para exibir totais
// Usar data.monthlyData para gráfico de linha e timeline
```

### Exemplo 2: Buscar detalhes de um mês específico

```typescript
const response = await fetch(
  `/financial-projection/month-details?organizationId=${orgId}&month=2024/02`
)
const data = await response.json()

// Usar data.expenses, data.gains, data.credits para listagem detalhada
// Usar data.totals para exibir totais do mês
```

### Exemplo 3: Converter centavos para reais

```typescript
function centsToReais(cents: number): number {
  return cents / 100
}

// Exemplo: 10050 centavos = R$ 100,50
const reais = centsToReais(10050) // 100.5
```

### Exemplo 4: Formatar data do mês

```typescript
function formatMonth(month: string): string {
  // month vem como "2024/02"
  const [year, monthNum] = month.split('/')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  // Retorna: "fevereiro de 2024"
}
```

---

## 🚨 Tratamento de Erros

Em caso de erro, a API retorna status `409` com a seguinte estrutura:

```json
{
  "message": "Mensagem de erro"
}
```

Exemplos de erros:
- `organizationId` não fornecido
- `month` em formato inválido
- Organização não encontrada

---

## ✅ Checklist de Implementação Frontend

- [ ] Integrar endpoint `/financial-projection/summary` para resumo e gráfico
- [ ] Integrar endpoint `/financial-projection/month-details` para detalhamento
- [ ] Implementar conversão de centavos para reais
- [ ] Implementar formatação de datas (mês e ISO)
- [ ] Tratar ordenação dos dados (meses e transações)
- [ ] Tratar meses sem projeções (omissão)
- [ ] Implementar tratamento de erros
- [ ] Implementar loading states
- [ ] Implementar cache/otimização de requisições

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de backend.

