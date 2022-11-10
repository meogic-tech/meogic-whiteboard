import {
  DecoratorNode,
  NodeKey,
  SerializedWhiteboardNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from "@meogic/whiteboard";
import { Component, h } from "vue";
import TextNodeVue from './TextNodeVue.vue'


export type SerializedTextNode = Spread<
  {
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    selected: boolean,
    editing: boolean
  },
  SerializedWhiteboardNode
  >;


export class TextNode extends DecoratorNode<Component> {
  static getType(): string {
    return 'text-node'
  }

  static clone(node: TextNode): TextNode {
    const shapeNode = new TextNode(node._x, node._y, node._width, node._height, node._text, node._selected, node._editing, node.__key)
    return shapeNode
  }

  //region 属性
  _x: number
  _y: number
  _width: number
  _height: number
  _text: string
  _selected: boolean
  _editing: boolean

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

  getText() : string {
    const self = this.getLatest()
    return self._text
  }

  getSelected() : boolean {
    const self = this.getLatest()
    return self._selected
  }

  getEditing() : boolean {
    const self = this.getLatest()
    return self._editing
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

  setText(text: string): this {
    const self = this.getWritable()
    self._text = text
    return this
  }

  setSelected(selected: boolean): this {
    const self = this.getWritable()
    self._selected = selected
    return this
  }

  setEditing(editing: boolean): this {
    const self = this.getWritable()
    self._editing = editing
    return this
  }


  //endregion

  constructor(x: number,
              y: number,
              width: number,
              height: number,
              text: string,
              selected: boolean,
              editing: boolean,
              key?: NodeKey) {
    super(key);
    this._x = x
    this._y = y
    this._width = width
    this._height = height
    this._text = text
    this._selected = selected
    this._editing = editing
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g')
    // @ts-ignore
    return g
  }


  decorate(whiteboard: Whiteboard, config: WhiteboardConfig): Component {
    return h(
      TextNodeVue,
      this.exportJSON()
    );
  }

  updateDOM(prevNode: TextNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedTextNode): TextNode {
    const node = $createTextNode(
      serializedNode.x,
      serializedNode.y,
      serializedNode.width,
      serializedNode.height,
      serializedNode.text,
      serializedNode.selected,
      serializedNode.editing,
    );
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      height: this.getHeight(),
      type: 'text-node',
      version: 1,
      width: this.getWidth(),
      x: this.getX(),
      y: this.getY(),
      text: this.getText(),
      selected: this.getSelected(),
      editing: this.getEditing(),
    };
  }

  //endregion

}

export function $createTextNode(x: number,
                                 y: number,
                                 width: number,
                                 height: number,
                                text: string,
                                selected: boolean,
                                editing: boolean) {
  return new TextNode(x, y, width, height, text, selected, editing)
}

export function $isTextNode(
  node: WhiteboardNode | null | undefined,
): node is TextNode {
  return node instanceof TextNode;
}
