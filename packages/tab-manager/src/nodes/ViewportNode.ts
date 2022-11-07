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
    const containerNode = new ViewportNode(node.__key)
    return containerNode
  }
  _offsetX: number
  _offsetY: number

  constructor(offsetX: number, offsetY: number, key?: NodeKey) {
    super(key);
    this._offsetX = offsetX;
    this._offsetY = offsetY;
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
    div.setAttribute('transform', `matrix(1, 0, 0, 1, ${this._offsetX}, ${this._offsetY})`)
    return div
  }

  updateDOM(prevNode: ViewportNode, dom: HTMLElement, config: TabManagerConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: ViewportNode, dom: HTMLElement, config: TabManagerConfig): boolean {
    dom.setAttribute('transform', `matrix(1, 0, 0, 1, ${this._offsetX}, ${this._offsetY})`)
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

export function $createViewportNode(offsetX: number, offsetY: number) {
  return new ViewportNode(offsetX, offsetY)
}

export function $isViewportNode(
  node: TabManagerNode | null | undefined,
): node is ViewportNode {
  return node instanceof ViewportNode;
}
