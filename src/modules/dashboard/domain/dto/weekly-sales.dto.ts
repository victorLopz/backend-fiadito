export class WeeklySalesDto {
  constructor(
    readonly date: string,
    readonly sales: number,
    readonly revenue: number
  ) {}
}
