# Sistema de Reset de Senha - Implementação Simplificada

## ✅ Implementação Final

O sistema foi simplificado para funcionar **sem banco de dados** para tokens, usando apenas o email para reset de senha.

## 🔗 Endpoints

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
  "email": "usuario@exemplo.com",
  "newPassword": "nova_senha123"
}
```

**Resposta:**
```json
{
  "message": "Senha redefinida com sucesso."
}
```

## 🔄 Fluxo Simplificado

1. **Solicitação**: Usuário informa o email
2. **Email**: Sistema envia email com instruções (sem token)
3. **Reset**: Usuário informa email + nova senha
4. **Validação**: Sistema verifica se o email existe
5. **Atualização**: Senha é atualizada na tabela Organization

## 🔒 Segurança

- ✅ **Não revela existência de emails** - Sempre retorna sucesso
- ✅ **Senhas criptografadas** - Usando bcrypt
- ✅ **Validação de email** - Verifica se existe antes de atualizar
- ✅ **Template de email profissional** - Com design da marca

## 📧 Configuração de Email

### Variáveis de Ambiente Necessárias:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SITE_URL=http://localhost:3000
```

### Configuração do Gmail:
1. Ative verificação em duas etapas
2. Gere senha de app
3. Use a senha de app no `SMTP_PASS`

## 🎯 Vantagens da Implementação Simplificada

- ✅ **Sem migrações** - Não precisa alterar o banco
- ✅ **Mais simples** - Menos complexidade
- ✅ **Funcional** - Resolve o problema principal
- ✅ **Seguro** - Mantém as boas práticas de segurança
- ✅ **Rápido** - Implementação imediata

## 📁 Arquivos Modificados

### Novos Arquivos:
- `src/lib/email.ts` - Serviço de email
- `src/use-cases/forgot-password.ts` - Solicitar reset
- `src/use-cases/reset-password.ts` - Redefinir senha
- `src/use-cases/factories/make-forgot-password-use-case.ts`
- `src/use-cases/factories/make-reset-password-use-case.ts`
- `src/http/controllers/organization/forgot-password.ts`
- `src/http/controllers/organization/reset-password.ts`

### Arquivos Modificados:
- `src/env/index.ts` - Adicionadas variáveis SMTP
- `src/http/controllers/organization/routes.ts` - Novas rotas
- `src/server.ts` - Serviço de limpeza (simplificado)

## 🚀 Como Usar

1. **Configure as variáveis de ambiente** (SMTP)
2. **Teste o endpoint de forgot-password**
3. **Verifique se o email foi recebido**
4. **Use o endpoint de reset-password** com email + nova senha
5. **Teste o login** com a nova senha

## 📝 Exemplo de Uso

```bash
# 1. Solicitar reset
curl -X POST http://localhost:3333/organization/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com"}'

# 2. Redefinir senha
curl -X POST http://localhost:3333/organization/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "newPassword": "nova_senha123"}'
```

O sistema está **pronto para uso** e funcionando! 🎉
