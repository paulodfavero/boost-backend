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

    console.log('=== VALIDATE IAP USE CASE - INÍCIO ===')
    console.log('Dados recebidos no use case:', {
      productId,
      transactionId,
      plan,
      organizationId,
      transactionReceiptLength: transactionReceipt?.length || 0,
      transactionReceiptPreview: transactionReceipt?.substring(0, 50) + '...',
    })

    try {
      // 1. Verificar se a organização existe
      console.log('1. Verificando se organização existe:', organizationId)
      const organization = await this.organizationsRepository.findById(
        organizationId,
      )
      if (!organization) {
        console.error('Organização não encontrada:', organizationId)
        throw new OrganizationNotFound()
      }
      console.log('Organização encontrada:', {
        id: organization.id,
        name: organization.name,
        currentPlan: organization.plan,
      })

      // 2. Validar se o produto está no mapeamento
      console.log('2. Validando mapeamento do produto:', productId)
      console.log('Mapeamento disponível:', productToPlanMap)
      const mappedPlan = productToPlanMap[productId]
      if (!mappedPlan) {
        console.error(`Produto não encontrado no mapeamento: ${productId}`)
        return { success: false, error: 'Produto não encontrado no mapeamento' }
      }
      console.log('Produto mapeado com sucesso:', { productId, mappedPlan })

      // 3. Verificar se o plano enviado corresponde ao mapeamento
      console.log('3. Verificando correspondência do plano:', {
        mappedPlan,
        receivedPlan: plan,
      })
      if (mappedPlan !== plan) {
        console.error(
          `Plano não corresponde ao produto: ${productId} -> ${mappedPlan} vs ${plan}`,
        )
        return { success: false, error: 'Plano não corresponde ao produto' }
      }
      console.log('Plano corresponde ao produto - OK')

      // 4. Validar recibo com a Apple
      console.log('4. Iniciando validação do recibo com Apple')
      const isValidReceipt = await this.validateReceiptWithApple(
        transactionReceipt,
        productId,
        transactionId,
      )
      if (!isValidReceipt) {
        console.error(`Recibo inválido para transação: ${transactionId}`)
        return { success: false, error: 'Recibo inválido ou expirado' }
      }
      console.log('Recibo validado com sucesso com Apple')

      // 5. Atualizar organização
      console.log('5. Atualizando organização com novo plano')
      await this.organizationsRepository.update({
        organizationId,
        data: {
          plan: mappedPlan,
          apple_iap_transaction_id: transactionId,
          updated_at: new Date(),
        },
      })
      console.log('Organização atualizada com sucesso')

      console.log(
        `IAP validado com sucesso para organização ${organizationId}: ${productId} -> ${mappedPlan}`,
      )
      console.log('=== VALIDATE IAP USE CASE - SUCESSO ===')

      return {
        success: true,
        message: 'Plano ativado com sucesso',
      }
    } catch (error) {
      console.error('=== VALIDATE IAP USE CASE - ERRO ===')
      console.error('Erro ao validar IAP:', error)
      console.error(
        'Stack trace:',
        error instanceof Error ? error.stack : 'No stack trace',
      )

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
    console.log('=== VALIDAÇÃO COM APPLE - INÍCIO ===')
    console.log('Parâmetros:', {
      productId,
      transactionId,
      receiptLength: receipt?.length,
    })

    try {
      const appleSharedSecret = env.APPLE_SHARED_SECRET
      if (!appleSharedSecret) {
        console.error('APPLE_SHARED_SECRET não configurado')
        return false
      }
      console.log(
        'APPLE_SHARED_SECRET configurado:',
        appleSharedSecret ? 'SIM' : 'NÃO',
      )

      // URL da Apple para validação (sandbox para desenvolvimento, production para produção)
      const isProduction = env.NODE_ENV === 'production'
      const appleUrl = isProduction
        ? 'https://buy.itunes.apple.com/verifyReceipt'
        : 'https://sandbox.itunes.apple.com/verifyReceipt'

      console.log('Ambiente:', {
        isProduction,
        appleUrl,
        nodeEnv: env.NODE_ENV,
      })

      const requestBody = {
        'receipt-data': receipt,
        password: appleSharedSecret,
        'exclude-old-transactions': true,
      }

      console.log('Request body preparado:', {
        receiptDataLength: requestBody['receipt-data']?.length,
        passwordLength: requestBody.password?.length,
        excludeOldTransactions: requestBody['exclude-old-transactions'],
      })

      console.log('Enviando requisição para Apple...')
      const response = await fetch(appleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Resposta da Apple recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        console.error(`Erro na comunicação com Apple: ${response.status}`)
        const errorText = await response.text()
        console.error('Conteúdo do erro:', errorText)
        return false
      }

      const appleResponse: AppleReceiptResponse = await response.json()
      console.log('Resposta da Apple parseada:', appleResponse)

      // Verificar status da resposta da Apple
      console.log(
        'Verificando status da resposta da Apple:',
        appleResponse.status,
      )
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
      console.log('Status da Apple válido (0)')

      // Verificar se o produto e transação estão no recibo
      console.log('Verificando estrutura do recibo:', {
        hasReceipt: !!appleResponse.receipt,
        hasInApp: !!appleResponse.receipt?.in_app,
        inAppLength: appleResponse.receipt?.in_app?.length || 0,
      })

      if (!appleResponse.receipt?.in_app) {
        console.error('Nenhuma compra in-app encontrada no recibo')
        return false
      }

      console.log(
        'Transações encontradas no recibo:',
        appleResponse.receipt.in_app.map((item) => ({
          product_id: item.product_id,
          transaction_id: item.transaction_id,
          purchase_date_ms: item.purchase_date_ms,
        })),
      )

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

      console.log('Transação encontrada no recibo:', purchase)
      console.log(
        `Recibo validado com sucesso para produto: ${productId}, transação: ${transactionId}`,
      )
      console.log('=== VALIDAÇÃO COM APPLE - SUCESSO ===')
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
