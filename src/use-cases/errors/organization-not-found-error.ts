export class OrganizationNotFound extends Error {
  constructor() {
    super('❌ Conta não encontrada. Verifique se o ID existe.')
  }
}
export class BankNotFound extends Error {
  constructor() {
    super('❌ Banco não encontrada. Verifique se o ID existe.')
  }
}
