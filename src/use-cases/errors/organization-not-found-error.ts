export class OrganizationNotFound extends Error {
  constructor() {
    super('❌ Conta não encontrada. Verifique se o ID existe.')
  }
}
