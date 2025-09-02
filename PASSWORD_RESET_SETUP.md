# Configuração do Sistema de Reset de Senha

## Visão Geral

O sistema de reset de senha foi implementado seguindo as melhores práticas de segurança:

1. **Segurança**: Não revela se um email existe ou não no sistema
2. **Tokens únicos**: Cada solicitação gera um token único e seguro
3. **Expiração**: Tokens expiram em 1 hora
4. **Uso único**: Tokens são invalidados após o uso
5. **Limpeza automática**: Tokens expirados são removidos automaticamente

## Endpoints

### 1. Solicitar Reset de Senha
```
POST /organization/forgot-password
Content-Type: application/json

{
  "email": "usuario@exemplo.com"
}
```

**Resposta:**
```json
{
  "message": "Se o email estiver cadastrado, você receberá um link para redefinir sua senha."
}
```

### 2. Redefinir Senha
```
POST /organization/reset-password
Content-Type: application/json

{
  "token": "token_do_email",
  "newPassword": "nova_senha123"
}
```

**Resposta:**
```json
{
  "message": "Senha redefinida com sucesso."
}
```

## Configuração de Email

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Configurações SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# URL do frontend (para o link de reset)
SITE_URL=http://localhost:3000
```

### Configuração do Gmail

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "Senha de App" específica para o projeto
3. Use essa senha no campo `SMTP_PASS`

### Outros Provedores

O sistema suporta qualquer provedor SMTP. Ajuste as configurações conforme necessário:

- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Provedor próprio**: Consulte a documentação do seu provedor

## Migração do Banco de Dados

Execute a migração para criar a tabela de tokens:

```bash
npx prisma migrate dev --name add_password_reset_token
```

## Fluxo de Funcionamento

1. **Solicitação**: Usuário informa o email
2. **Validação**: Sistema não verifica se o email existe (segurança)
3. **Token**: Gera token único com expiração de 1 hora
4. **Email**: Envia email com link contendo o token
5. **Reset**: Usuário acessa o link e define nova senha
6. **Validação**: Sistema valida token e atualiza senha
7. **Limpeza**: Token é marcado como usado e removido

## Segurança

- Tokens são gerados usando `crypto.randomBytes(32)`
- Senhas são criptografadas com bcrypt
- Tokens expiram automaticamente
- Sistema não revela informações sobre emails cadastrados
- Limpeza automática de tokens expirados

## Monitoramento

O sistema inclui logs para monitoramento:
- Erros de envio de email
- Tokens expirados removidos
- Tentativas de uso de tokens inválidos

## Testes

Para testar o sistema:

1. Configure as variáveis de ambiente
2. Execute a migração
3. Faça uma solicitação de reset
4. Verifique se o email foi recebido
5. Use o token para redefinir a senha
6. Teste o login com a nova senha
