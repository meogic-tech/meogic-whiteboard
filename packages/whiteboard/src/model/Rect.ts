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
  containerPoint(point?: Point, x?: number, y?: number): boolean {
    let p: Point
    if (point) {
      p = point
    } else {
      p = new Point(x!, y!)
    }
    return p.x >= this.getLeft() && p.x <= this.getRight()
      && p.y >= this.getTop() && p.y <= this.getBottom()
  }

  interactRect(rect: Rect): boolean{
    return this.containerPoint(rect.getLeftTop()) || this.containerPoint(rect.getLeftBottom())
    || this.containerPoint(rect.getRightTop()) || this.containerPoint(rect.getRightBottom())
    || rect.containerPoint(this.getLeftTop()) || rect.containerPoint(this.getLeftBottom())
    || rect.containerPoint(this.getRightTop()) || rect.containerPoint(this.getRightBottom())
  }

  /**
   * 传一个就是横竖两个方向的每边都扩展对应的数值
   * @param size
   */
  extend(size: number): void;
  extend(sizeOrX: number, y?: number){
    this.x -= sizeOrX
    this.y -= y !== undefined ? y : sizeOrX
  }

  extendWithRect(rect: Rect): Rect {
    const r = new Rect(this.x, this.y, this.width, this.height)
    r.x = Math.min(this.getLeft(), rect.getLeft())
    r.y = Math.min(this.getTop(), rect.getTop())
    r.width = Math.max(this.getRight(), rect.getRight()) - r.x
    r.height = Math.max(this.getBottom(), rect.getBottom()) - r.y
    return r
  }

}
