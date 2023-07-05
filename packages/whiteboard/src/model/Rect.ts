import { Point } from './Point';


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

  getLeftMiddle(): Point {
    return new Point(this.getLeft(), this.getTop() + this.height / 2)
  }

  getRightMiddle(): Point {
    return new Point(this.getRight(), this.getTop() + this.height / 2)
  }

  getTopMiddle(): Point {
    return new Point(this.getLeft() + this.width / 2, this.getTop())
  }

  getBottomMiddle(): Point {
    return new Point(this.getLeft() + this.width / 2, this.getBottom())
  }

  getCenter(): Point {
    return new Point(this.getLeft() + this.width / 2, this.getTop() + this.height / 2)
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

  interactRect(rect: Rect): boolean {
    // 四个角有被包含的场景
    return this.containerPoint(rect.getLeftTop()) || this.containerPoint(rect.getLeftBottom())
    || this.containerPoint(rect.getRightTop()) || this.containerPoint(rect.getRightBottom())
    || rect.containerPoint(this.getLeftTop()) || rect.containerPoint(this.getLeftBottom())
    || rect.containerPoint(this.getRightTop()) || rect.containerPoint(this.getRightBottom())

    // 四个角在范围内的场景
    // 自己是横向，rect是竖向
      /**
       *    -----
       * ---|---|--------
       * |  |   |       |
       * ---|---|--------
       *    |   |
       *    -----
       */
    || (rect.getLeft() >= this.getLeft() && rect.getRight() <= this.getRight()
        && this.getTop() >= rect.getTop() && this.getBottom() <= rect.getBottom()
      )
    // 自己是竖向，rect是横向
    || (this.getLeft() >= rect.getLeft() && this.getRight() <= rect.getRight()
        && rect.getTop() >= this.getTop() && rect.getBottom() <= this.getBottom()
      )
  }

  /**
   * 传一个就是横竖两个方向的每边都扩展对应的数值
   * @param size
   */
  extend(size: number): void;
  extend(sizeOrX: number, y?: number) {
    this.x -= sizeOrX
    this.y -= y !== undefined ? y : sizeOrX
    this.width += sizeOrX * 2
    this.height += (y !== undefined ? y : sizeOrX) * 2
  }

  extendWithRect(rect: Rect): Rect {
    const r = new Rect(this.x, this.y, this.width, this.height)
    r.x = Math.min(this.getLeft(), rect.getLeft())
    r.y = Math.min(this.getTop(), rect.getTop())
    r.width = Math.max(this.getRight(), rect.getRight()) - r.x
    r.height = Math.max(this.getBottom(), rect.getBottom()) - r.y
    return r
  }

  /**
   * 获取最真实的矩形之间的距离
   * 写一个ts函数，在类Rect里，名叫distance，传入参数是rect:Rect
   * class Rect {
   *   x: number
   *   y: number
   *   width: number
   *   height: number
   * }
   * 要做的是获取this和rect之间的距离
   * 1. 计算穿过两个中心点的线段方程
   * 2. 计算线段方程和矩形交点
   * 3. 返回两个交点的距离
   * 考虑矩形左右排列和上下排列两种情况
   *
   * @param rect
   */
  distance(rect: Rect): number {
    const center1 = this.getCenter();
    const center2 = rect.getCenter();

    const slope = (center2.y - center1.y) / (center2.x - center1.x);
    const intercept = center1.y - slope * center1.x;

    const getIntersection = (r: Rect, c1: { x: number; y: number }, c2: { x: number; y: number }) => {
      if (c1.x === c2.x && c1.y === c2.y) {
        return c1;
      }

      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;

      const t1 = (r.x - c1.x) / dx;
      const t2 = (r.x + r.width - c1.x) / dx;
      const t3 = (r.y - c1.y) / dy;
      const t4 = (r.y + r.height - c1.y) / dy;

      const tMin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
      const tMax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

      if (tMax < 0 || tMin > tMax) {
        return null;
      }

      const t = tMin < 0 ? tMax : tMin;

      return {
        x: c1.x + t * dx,
        y: c1.y + t * dy,
      };
    };

    const intersection1 = getIntersection(this, center1, center2);
    const intersection2 = getIntersection(rect, center1, center2);
    if ( intersection1 && intersection2) {
      const dx = intersection1.x - intersection2.x;
      const dy = intersection1.y - intersection2.y;

      if (this.interactRect(rect)) {
        return -Math.sqrt(dx * dx + dy * dy);
      } else {
        return Math.sqrt(dx * dx + dy * dy);
      }

    } else {
      return 0
    }
  }
}
