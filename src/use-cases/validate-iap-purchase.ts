import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { env } from '@/env'

// Mapeamento de produtos para planos
const productToPlanMap: Record<string, string> = {
  'boost.plus.monthly': 'PLUS',
  'boost.plus.annual2': 'PLUS',
  boostfinance: 'ESSENCIAL',
  essencialannual: 'ESSENCIAL',
  'boost.pro.monthly': 'PRO',
  'boost.pro.annual2': 'PRO',
}

interface ValidateIAPPurchaseRequest {
  productId: string
  transactionId: string
  transactionReceipt: string
  plan: string
  transactionDate: number
  organizationId: string
}

interface AppleReceiptResponse {
  status: number
  receipt?: {
    in_app?: Array<{
      product_id: string
      transaction_id: string
      purchase_date_ms: string
    }>
  }
  environment?: string
}

export class ValidateIAPPurchaseUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute(
    data: ValidateIAPPurchaseRequest,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const {
      productId,
      transactionId,
      transactionReceipt,
      plan,
      organizationId,
    } = data

    try {
      // 1. Verificar se a organização existe
      const organization = await this.organizationsRepository.findById(
        organizationId,
      )
      if (!organization) {
        throw new OrganizationNotFound()
      }

      // 2. Validar se o produto está no mapeamento
      const mappedPlan = productToPlanMap[productId]
      if (!mappedPlan) {
        console.error(`Produto não encontrado no mapeamento: ${productId}`)
        return { success: false, error: 'Produto não encontrado no mapeamento' }
      }

      // 3. Verificar se o plano enviado corresponde ao mapeamento
      if (mappedPlan !== plan) {
        console.error(
          `Plano não corresponde ao produto: ${productId} -> ${mappedPlan} vs ${plan}`,
        )
        return { success: false, error: 'Plano não corresponde ao produto' }
      }

      // 4. Validar recibo com a Apple
      const isValidReceipt = await this.validateReceiptWithApple(
        transactionReceipt,
        productId,
        transactionId,
      )
      if (!isValidReceipt) {
        console.error(`Recibo inválido para transação: ${transactionId}`)
        return { success: false, error: 'Recibo inválido ou expirado' }
      }

      // 5. Atualizar organização
      await this.organizationsRepository.update({
        organizationId,
        data: {
          plan: mappedPlan,
          apple_iap_transaction_id: transactionId,
          updated_at: new Date(),
        },
      })

      console.log(
        `IAP validado com sucesso para organização ${organizationId}: ${productId} -> ${mappedPlan}`,
      )

      return {
        success: true,
        message: 'Plano ativado com sucesso',
      }
    } catch (error) {
      console.error('Erro ao validar IAP:', error)

      if (error instanceof OrganizationNotFound) {
        return { success: false, error: 'Organização não encontrada' }
      }

      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  private async validateReceiptWithApple(
    receipt: string,
    productId: string,
    transactionId: string,
  ): Promise<boolean> {
    try {
      const appleSharedSecret = env.APPLE_SHARED_SECRET
      if (!appleSharedSecret) {
        console.error('APPLE_SHARED_SECRET não configurado')
        return false
      }

      // URL da Apple para validação (sandbox para desenvolvimento, production para produção)
      const isProduction = env.NODE_ENV === 'production'
      const appleUrl = isProduction
        ? 'https://buy.itunes.apple.com/verifyReceipt'
        : 'https://sandbox.itunes.apple.com/verifyReceipt'

      const requestBody = {
        'receipt-data': receipt,
        password: appleSharedSecret,
        'exclude-old-transactions': true,
      }

      const response = await fetch(appleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        console.error(`Erro na comunicação com Apple: ${response.status}`)
        return false
      }

      const appleResponse: AppleReceiptResponse = await response.json()

      // Verificar status da resposta da Apple
      if (appleResponse.status !== 0) {
        console.error(`Status inválido da Apple: ${appleResponse.status}`)
        return false
      }

      // Verificar se o produto e transação estão no recibo
      if (!appleResponse.receipt?.in_app) {
        console.error('Nenhuma compra in-app encontrada no recibo')
        return false
      }

      const purchase = appleResponse.receipt.in_app.find(
        (item) =>
          item.product_id === productId &&
          item.transaction_id === transactionId,
      )

      if (!purchase) {
        console.error(`Transação não encontrada no recibo: ${transactionId}`)
        return false
      }

      console.log(
        `Recibo validado com sucesso para produto: ${productId}, transação: ${transactionId}`,
      )
      return true
    } catch (error) {
      console.error('Erro ao validar recibo com Apple:', error)
      return false
    }
  }
}
