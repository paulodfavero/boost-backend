import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { env } from '@/env'

// Mapeamento de produtos para planos
const productToPlanMap: Record<string, string> = {
  boost_essencial_monthly_14_90: 'ESSENCIAL',
  boost_essencial_annual_129_90: 'ESSENCIAL',
  boost_plus_monthly_24_90: 'PLUS',
  boost_plus_annual_199_90: 'PLUS',
  boost_pro_monthly_34_90: 'PRO',
  boost_pro_annual_249_90: 'PRO',
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
      const organization = await this.organizationsRepository.findById(
        organizationId,
      )
      if (!organization) {
        console.error('Organização não encontrada:', organizationId)
        throw new OrganizationNotFound()
      }

      const mappedPlan = productToPlanMap[productId]
      if (!mappedPlan) {
        console.error(`Produto não encontrado no mapeamento: ${productId}`)
        return { success: false, error: 'Produto não encontrado no mapeamento' }
      }

      if (mappedPlan !== plan) {
        console.error(
          `Plano não corresponde ao produto: ${productId} -> ${mappedPlan} vs ${plan}`,
        )
        return { success: false, error: 'Plano não corresponde ao produto' }
      }

      const isValidReceipt = await this.validateReceiptWithApple(
        transactionReceipt,
        productId,
        transactionId,
      )
      if (!isValidReceipt) {
        console.error(`Recibo inválido para transação: ${transactionId}`)
        return { success: false, error: 'Recibo inválido ou expirado' }
      }

      await this.organizationsRepository.update({
        organizationId,
        data: {
          plan: mappedPlan,
          apple_iap_transaction_id: transactionId,
          updated_at: new Date(),
        },
      })

      return {
        success: true,
        message: 'Plano ativado com sucesso',
      }
    } catch (error) {
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
        const errorText = await response.text()
        console.error('Conteúdo do erro:', errorText)
        return false
      }

      const appleResponse: AppleReceiptResponse = await response.json()

      if (appleResponse.status !== 0) {
        console.error(`Status inválido da Apple: ${appleResponse.status}`)
        console.error('Possíveis significados dos status codes:')
        console.error('- 21000: The App Store could not read the receipt data')
        console.error(
          '- 21002: The receipt data property was malformed or missing',
        )
        console.error('- 21003: The receipt could not be authenticated')
        console.error(
          '- 21004: The shared secret you provided does not match the shared secret on file',
        )
        console.error('- 21005: The receipt server is not currently available')
        console.error(
          '- 21006: This receipt is valid but the subscription has expired',
        )
        console.error(
          '- 21007: This receipt is from the test environment, but it was sent to the production environment',
        )
        console.error(
          '- 21008: This receipt is from the production environment, but it was sent to the test environment',
        )
        return false
      }

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
        console.error('Procurando por:', { productId, transactionId })
        console.error(
          'Transações disponíveis:',
          appleResponse.receipt.in_app.map((item) => ({
            product_id: item.product_id,
            transaction_id: item.transaction_id,
          })),
        )
        return false
      }

      return true
    } catch (error) {
      console.error('=== VALIDAÇÃO COM APPLE - ERRO ===')
      console.error('Erro ao validar recibo com Apple:', error)
      console.error(
        'Stack trace:',
        error instanceof Error ? error.stack : 'No stack trace',
      )
      return false
    }
  }
}
