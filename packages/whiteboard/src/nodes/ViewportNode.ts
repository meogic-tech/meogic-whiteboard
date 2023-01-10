import { NodeKey, WhiteboardNode } from "../";

import { Spread, Whiteboard, WhiteboardConfig } from '../Whiteboard';
import { ElementNode, SerializedElementNode } from './ElementNode';


export type SerializedViewportNode = Spread<
  {
    offsetX: number,
    offsetY: number,
    zoom: number
  },
  SerializedElementNode
  >;

export class ViewportNode extends ElementNode {
  static getType(): string {
    return 'viewport-node'
  }

  static clone(node: ViewportNode): ViewportNode {
    const containerNode = new ViewportNode(node._offsetX, node._offsetY, node._zoom, node.__key)
    return containerNode
  }
  _offsetX: number
  _offsetY: number
  _zoom: number

  constructor(offsetX: number, offsetY: number, zoom: number, key?: NodeKey) {
    super(key);
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._zoom = zoom
  }

  getOffsetX() : number {
    const self = this.getLatest()
    return self._offsetX
  }

  getOffsetY() : number {
    const self = this.getLatest()
    return self._offsetY
  }

  getZoom() : number {
    const self = this.getLatest()
    return self._zoom
  }

  setOffsetX(offsetX: number) {
    const self = this.getWritable()
    self._offsetX = offsetX
  }

  setOffsetY(offsetY: number) {
    const self = this.getWritable()
    self._offsetY = offsetY
  }

  setZoom(zoom: number) {
    const self = this.getWritable()
    self._zoom = zoom
  }


//region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const self = this.getLatest()
    const svgNS = 'http://www.w3.org/2000/svg';
    const div = document.createElement('div')
    const transform = `matrix(${self._zoom}, 0, 0, ${self._zoom}, ${self._offsetX}, ${self._offsetY})`
    div.style.width = '100%'
    div.style.height = '100%'
    div.style.transform = transform
    // div.setAttribute('transform', `matrix(${this._zoom}, 0, 0, ${this._zoom}, ${this._offsetX}, ${this._offsetY})`)
    div.style.position = 'relative'
    div.style.transition = 'transform .1s linear'
    // @ts-ignore
    return div
  }

  updateDOM(prevNode: ViewportNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: ViewportNode, dom: HTMLElement, config: WhiteboardConfig) {
    console.log("updateDOMProperties");
    const self = this.getLatest()
    // dom.setAttribute('transform', `matrix(${this._zoom}, 0, 0, ${this._zoom}, ${this._offsetX}, ${this._offsetY})`)
    dom.style.transform = `matrix(${self._zoom}, 0, 0, ${self._zoom}, ${self._offsetX}, ${self._offsetY})`
  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedViewportNode): ViewportNode {
    const node = $createViewportNode(serializedNode.offsetX, serializedNode.offsetY, serializedNode.zoom);
    return node;
  }

  exportJSON(): SerializedViewportNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      offsetX: self._offsetX,
      offsetY: self._offsetY,
      zoom: self._zoom,
      type: 'viewport-node',
      version: 1,
    };
  }

  //endregion

}

export function $createViewportNode(offsetX: number, offsetY: number, zoom: number) {
  return new ViewportNode(offsetX, offsetY, zoom)
}

export function $isViewportNode(
  node: WhiteboardNode | null | undefined,
): node is ViewportNode {
  return node instanceof ViewportNode;
}
