export class CompanyNotFound extends Error {
  constructor() {
    super(' Essa empresa não existe')
  }
}
