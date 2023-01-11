import { Point } from "./Point";


export class Rect {
  x: number
  y: number
  width: number
  height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  getLeft(): number {
    return this.x
  }

  getRight(): number {
    return this.x + this.width
  }

  getTop(): number {
    return this.y
  }

  getBottom(): number {
    return this.y + this.height
  }

  getLeftTop(): Point {
    return new Point(this.getLeft(), this.getTop())
  }

  getRightTop(): Point {
    return new Point(this.getRight(), this.getTop())
  }

  getLeftBottom(): Point {
    return new Point(this.getLeft(), this.getBottom())
  }

  getRightBottom(): Point {
    return new Point(this.getRight(), this.getBottom())
  }

  containerPoint(point: Point): boolean;
  containerPoint(x: number, y: number): boolean
  {
    const point = new Point(x, y)
    return point.x >= this.getLeft() && point.x <= this.getRight()
      && point.y >= this.getTop() && point.y <= this.getBottom()
  }

  interactRect(rect: Rect): boolean{

    return this.containerPoint()
  }
}
