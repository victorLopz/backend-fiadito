export class Money {
  constructor(readonly amount: number) {
    if (amount < 0) throw new Error('Money cannot be negative');
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }
}
