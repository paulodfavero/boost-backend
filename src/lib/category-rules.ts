const STREAMING_KEYWORDS = [
  'netflix',
  'amazon',
  'prime video',
  'disney',
  'star',
  'hbo',
  'paramount',
  'apple tv',
  'youtube',
  'crunchyroll',
  'lionsgate',
  'vix',
  'pluto tv',
  'globoplay',
  'sbt',
  'bandplay',
  'claro tv',
  'oi play',
]

const PHARMACY_KEYWORDS = [
  'droga',
  'pague menos',
  'extrafarma',
  'panvel',
  'ultrafarma',
  'onofre',
  'nissei',
  'venâncio',
  'venancio',
  'pacheco',
  'farma',
  'super popular',
]

function normalizeTextToCompare(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function validateInvestmentCategory(
  description: string,
  category: string,
): string {
  const desc = description.toLowerCase()

  if (desc.includes('pix')) {
    return 'Transferência - PIX'
  }
  if (
    desc.includes('fatura') ||
    desc.includes('cartao') ||
    desc.includes('pag boleto') ||
    desc.includes('cartão') ||
    desc.includes('pagamento efetuado')
  ) {
    return 'Pagamento de cartão de crédito'
  }

  if (
    desc.includes('aplic') ||
    desc.includes('invest') ||
    desc.includes('tesouro') ||
    desc.includes('cdb') ||
    desc.includes('lci') ||
    desc.includes('fundo')
  ) {
    return category
  }

  return category
}

function validateStreamingCategory(
  description: string,
  category: string,
): string {
  const normalizedDescription = normalizeTextToCompare(description)
  const isStreaming = STREAMING_KEYWORDS.some((keyword) =>
    normalizedDescription.includes(keyword),
  )

  if (isStreaming) {
    return 'Video streaming'
  }

  return category
}

function validatePharmacyCategory(
  description: string,
  category: string,
): string {
  const normalizedDescription = normalizeTextToCompare(description)
  const isPharmacy = PHARMACY_KEYWORDS.some((keyword) =>
    normalizedDescription.includes(keyword),
  )

  if (isPharmacy) {
    return 'Pharmacy'
  }

  return category
}

/**
 * Applies domain rules to adjust the category based on description.
 * Order: streaming -> pharmacy -> investment.
 */
export function applyCategoryRules(
  description: string,
  category: string,
): string {
  const adjustedCategory = category

  const streamingAdjusted = validateStreamingCategory(
    description,
    adjustedCategory,
  )
  if (streamingAdjusted !== adjustedCategory) {
    return streamingAdjusted
  }

  const pharmacyAdjusted = validatePharmacyCategory(
    description,
    adjustedCategory,
  )
  if (pharmacyAdjusted !== adjustedCategory) {
    return pharmacyAdjusted
  }

  return validateInvestmentCategory(description, adjustedCategory)
}
