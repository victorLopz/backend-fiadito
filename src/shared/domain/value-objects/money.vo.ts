export class Money {
  constructor(readonly amount: number) {
    if (!Number.isFinite(amount)) {
      throw new Error("Money must be finite")
    }

    if (amount < 0) {
      throw new Error("Money cannot be negative")
    }
  }

  static zero(): Money {
    return new Money(0)
  }

  add(other: Money): Money {
    return new Money(Number((this.amount + other.amount).toFixed(2)))
  }

  multiply(multiplier: number): Money {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new Error("Multiplier must be a non-negative finite number")
    }

    return new Money(Number((this.amount * multiplier).toFixed(2)))
  }

  toNumber(): number {
    return this.amount
  }
}
