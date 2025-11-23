export class BillNotFoundError extends Error {
  constructor() {
    super('Bill not found')
  }
}
