export class OrganizationAlreadyExistsError extends Error {
  constructor() {
    super('Já existe uma conta com esse e-mail')
  }
}
