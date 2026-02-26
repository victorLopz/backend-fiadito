export class BusinessId {
  constructor(readonly value: string) {
    if (!value) throw new Error('BusinessId is required');
  }
}
