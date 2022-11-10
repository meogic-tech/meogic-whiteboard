import {
  ElementNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from '../';


export type SerializedShapeNode = Spread<
  {
    x: number,
    y: number,
    width: number,
    height: number,
  },
  SerializedElementNode
  >;


export class ShapeNode extends ElementNode {
  static getType(): string {
    return 'shape-node'
  }

  static clone(node: ShapeNode): ShapeNode {
    const shapeNode = new ShapeNode(node._x, node._y, node._width, node._height, node.__key)
    return shapeNode
  }

  //region 属性
  _x: number
  _y: number
  _width: number
  _height: number

  getX() : number {
    const self = this.getLatest()
    return self._x
  }

  getY() : number {
    const self = this.getLatest()
    return self._y
  }

  getWidth() : number {
    const self = this.getLatest()
    return self._width
  }

  getHeight() : number {
    const self = this.getLatest()
    return self._height
  }

  setX(x: number): this {
    const self = this.getWritable()
    self._x = x
    return this
  }

  setY(y: number): this {
    const self = this.getWritable()
    self._y = y
    return this
  }

  setWidth(width: number): this {
    const self = this.getWritable()
    self._width = width
    return this
  }

  setHeight(height: number): this {
    const self = this.getWritable()
    self._height = height
    return this
  }


  //endregion

  constructor(x: number,
              y: number,
              width: number,
              height: number,
              key?: NodeKey) {
    super(key);
    this._x = x
    this._y = y
    this._width = width
    this._height = height
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const self = this.getLatest();
    const svgNS = 'http://www.w3.org/2000/svg';
    const rect = document.createElementNS(svgNS, 'rect')
    rect.setAttributeNS(null, 'x', self._x.toString());
    rect.setAttributeNS(null, 'y', self._y.toString());
    rect.setAttributeNS(null, 'height', self._height.toString());
    rect.setAttributeNS(null, 'width', self._width.toString());
    rect.setAttributeNS(null, 'style', 'fill:blue;stroke:pink;stroke-width:5');
    // @ts-ignore
    return rect as HTMLElement
  }

  updateDOM(prevNode: ShapeNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: ShapeNode, dom: HTMLElement, config: WhiteboardConfig): void {
    if(this._x !== prevNode._x){
      dom.setAttributeNS(null, 'x', this._x.toString());
    }
    if(this._y !== prevNode._y){
      dom.setAttributeNS(null, 'y', this._y.toString());
    }
  }
  //endregion

  //region json
  static importJSON(serializedNode: SerializedShapeNode): ShapeNode {
    const node = $createShapeNode(
      serializedNode.x,
      serializedNode.y,
      serializedNode.width,
      serializedNode.height
    );
    return node;
  }

  exportJSON(): SerializedShapeNode {
    return {
      ...super.exportJSON(),
      height: this.getHeight(),
      type: 'shape-node',
      version: 1,
      width: this.getWidth(),
      x: this.getX(),
      y: this.getY(),
    };
  }

  //endregion

}

export function $createShapeNode(x: number,
                                 y: number,
                                 width: number,
                                 height: number) {
  return new ShapeNode(x, y, width, height)
}

export function $isShapeNode(
  node: WhiteboardNode | null | undefined,
): node is ShapeNode {
  return node instanceof ShapeNode;
}
