# Variáveis de Ambiente Necessárias

## Configurações Existentes

```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/api-boost-finance-pg"

# Configurações JWT
JWT_SECRET="your-jwt-secret-key"

# Configurações do Servidor
PORT=3333
NODE_ENV=dev

# Configurações do Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# URL do Frontend (para links de reset de senha)
SITE_URL="http://localhost:3000"
```

## Novas Configurações para Reset de Senha

Adicione estas variáveis ao seu arquivo `.env`:

```env
# Configurações SMTP (para envio de emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

### Configuração do Gmail

1. Ative a verificação em duas etapas na sua conta Google
2. Vá em "Gerenciar sua Conta Google" > "Segurança"
3. Em "Como você faz login no Google", clique em "Senhas de app"
4. Gere uma nova senha de app para "Email"
5. Use essa senha no campo `SMTP_PASS`

### Outros Provedores

- **Outlook/Hotmail**: 
  ```env
  SMTP_HOST="smtp-mail.outlook.com"
  SMTP_PORT=587
  ```

- **Yahoo**: 
  ```env
  SMTP_HOST="smtp.mail.yahoo.com"
  SMTP_PORT=587
  ```

- **Provedor próprio**: Consulte a documentação do seu provedor
