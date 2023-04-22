export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  distanceTo(other: Point): number {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }
  isEqual(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }
}
