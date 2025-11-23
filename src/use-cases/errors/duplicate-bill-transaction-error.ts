export class DuplicateBillTransactionError extends Error {
  constructor() {
    super('Já existe uma conta criada a partir desta transação')
  }
}

