export class PhoneE164 {
  constructor(readonly value: string) {
    if (!/^\+[1-9]\d{6,14}$/.test(value)) throw new Error("Phone must be E.164 format")
  }
}
