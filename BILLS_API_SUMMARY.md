# 📋 Resumo - API de Contas a Pagar (Bills)

## 🎯 O que é?

Sistema de **alertas de contas a pagar** que funciona como lembretes mensais. O usuário cria uma conta e ela aparece todo mês como alerta até ser marcada como paga.

---

## 🔌 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/bills` | Buscar contas (filtros: month, year, paid) |
| `POST` | `/bills/:organizationId` | Criar conta (gera automaticamente para 12 meses) |
| `PUT` | `/bills/:billId` | Atualizar conta |
| `PATCH` | `/bills/:billId/mark-as-paid` | Marcar como pago (alerta some) |
| `DELETE` | `/bills/:billId` | Deletar conta |
| `POST` | `/bills/:organizationId/generate-monthly` | Gerar contas do próximo mês |

---

## 📊 Estrutura de Dados

```typescript
{
  id: string
  description: string        // "Aluguel"
  company: string           // "Imobiliária ABC"
  category?: string         // "Moradia"
  amount: number            // 150000 (centavos = R$ 1.500,00)
  expiration_date: DateTime // Data de vencimento
  day_of_month: number      // 15 (dia que vence todo mês)
  paid: boolean             // false = não pago (aparece no alerta)
  active: boolean           // true = gera mensalmente
  source_transaction_id?: string
}
```

---

## 🔄 Como Funciona

### 1. **Criar Conta**
```javascript
POST /bills/abc123
{
  "description": "Aluguel",
  "company": "Imobiliária ABC",
  "amount": 150000,
  "expirationDate": "2024-11-15T00:00:00.000Z",
  "dayOfMonth": 15
}
```
→ Cria **apenas UMA conta** (a primeira). Use `generate-monthly` para gerar as próximas mensalmente.

### 2. **Exibir Alertas**
```javascript
GET /bills?organizationId=abc123&month=11&year=2024&paid=false
```
→ Retorna apenas contas **não pagas** do mês

### 4. **Marcar como Pago**
```javascript
PATCH /bills/bill_001/mark-as-paid
```
→ `paid: true` → **Alerta desaparece** (não aparece mais na busca com `paid=false`)


---

## 💡 Fluxo no Frontend

```
1. Usuário cria conta → POST /bills
   ↓
2. Sistema cria UMA conta (active: true)
   ↓
3. Frontend busca contas não pagas → GET /bills?paid=false
   ↓
4. Exibe alertas: "Aluguel vence em 5 dias"
   ↓
5. Usuário marca como pago → PATCH /bills/:id/mark-as-paid
   ↓
6. Alerta some (não aparece mais)
   ↓
7. Cron job mensal → POST /generate-monthly
   ↓
8. Sistema gera contas do próximo mês baseado em todas as contas active: true
```

---

## 🎨 Exemplo de Uso

### Buscar Contas do Mês Atual
```javascript
const month = new Date().getMonth() + 1
const year = new Date().getFullYear()

const bills = await fetch(
  `/bills?organizationId=${orgId}&month=${month}&year=${year}&paid=false`
)
```

### Marcar como Pago
```javascript
await fetch(`/bills/${billId}/mark-as-paid`, { method: 'PATCH' })
// Alerta desaparece automaticamente
```

### Criar Nova Conta
```javascript
await fetch(`/bills/${orgId}`, {
  method: 'POST',
  body: JSON.stringify({
    description: "Internet",
    company: "Provedor XYZ",
    amount: 9900,  // R$ 99,00
    expirationDate: new Date().toISOString(),
    dayOfMonth: 10
  })
})
// Cria apenas 1 conta. Use generate-monthly para gerar as próximas.
```

---

## ⚠️ Pontos Importantes

1. **Valores em centavos**: `150000` = R$ 1.500,00
2. **Contas pagas não aparecem**: Filtrar por `paid=false` para alertas
3. **Criar conta**: Cria apenas UMA conta (a primeira)
4. **Geração mensal**: Use `generate-monthly` mensalmente (cron job) para gerar as próximas
5. **Contas ativas**: Apenas contas com `active: true` são geradas pelo `generate-monthly`
6. **Dia do mês ajustado**: Se criar dia 31, em fevereiro vira 28/29 automaticamente
7. **Não duplica**: `generate-monthly` não cria contas que já existem

---

## 🚀 Próximos Passos

- [ ] Integração OpenAI para sugerir contas baseado em transações
- [ ] Cron job para gerar contas automaticamente todo mês
- [ ] Notificações push de contas a vencer
- [ ] Dashboard com estatísticas

---

**Ver documentação completa em:** `BILLS_API_DOCUMENTATION.md`

