import { NodeKey, TabManagerNode } from "@meogic/tab-manager";

import { Spread, TabManager, TabManagerConfig } from '../TabManager';
import { ElementNode, SerializedElementNode } from './ElementNode';


export type SerializedViewportNode = Spread<
  {
    offsetX: number,
    offsetY: number
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


//region DOM
  createDOM(config: TabManagerConfig, tabManager: TabManager): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const div = document.createElementNS(svgNS, 'g')
    div.setAttribute('transform', `matrix(${this._zoom}, 0, 0, ${this._zoom}, ${this._offsetX}, ${this._offsetY})`)
    return div
  }

  updateDOM(prevNode: ViewportNode, dom: HTMLElement, config: TabManagerConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: ViewportNode, dom: HTMLElement, config: TabManagerConfig) {
    dom.setAttribute('transform', `matrix(${this._zoom}, 0, 0, ${this._zoom}, ${this._offsetX}, ${this._offsetY})`)
  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedViewportNode): ViewportNode {
    const node = $createViewportNode(serializedNode.offsetX, serializedNode.offsetY);
    return node;
  }

  exportJSON(): SerializedViewportNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      offsetX: self._offsetX,
      offsetY: self._offsetY,
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
  node: TabManagerNode | null | undefined,
): node is ViewportNode {
  return node instanceof ViewportNode;
}
