import {
  $createShapeNode,
  ElementNode,
  NodeKey,
  SerializedElementNode, ShapeNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from "../";
import { SerializedShapeNode } from "./ShapeNode";

export type SerializedBackgroundNode = Spread<
  {
    offsetX: number,
    offsetY: number,
    zoom: number,
    type: 'background-node'
  },
  SerializedElementNode
  >;

export class BackgroundNode extends ElementNode {
  static getType(): string {
    return 'background-node'
  }

  static clone(node: BackgroundNode): BackgroundNode {
    const backgroundNode = new BackgroundNode(node._offsetX, node._offsetY, node._zoom, node.__key)
    return backgroundNode
  }

  //region 属性
  _offsetX: number
  _offsetY: number
  _zoom: number
  //endregion


  constructor(offsetX: number, offsetY: number, zoom: number, key?: NodeKey) {
    super(key);
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._zoom = zoom;
  }

  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.left = '0'
    div.style.top = '0'
    div.style.right = '0'
    div.style.bottom = '0'
    div.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuXzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgcng9IjEiIHJ5PSIxIiBmaWxsPSIjYWFhYWFhIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm5fMCkiLz48L3N2Zz4=")'
    div.style.backgroundPosition = `left ${this._offsetX}px top ${this._offsetY}px`
    div.style.zIndex = '-1'
    return div
  }

  updateDOM(prevNode: BackgroundNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: BackgroundNode, dom: HTMLElement, config: WhiteboardConfig) {
    dom.style.backgroundPosition = `left ${this._offsetX}px top ${this._offsetY}px`
  }

  //region json
  static importJSON(serializedNode: SerializedBackgroundNode): BackgroundNode {
    const node = $createBackgroundNode(
      serializedNode.offsetX,
      serializedNode.offsetY,
      serializedNode.zoom,
    );
    return node;
  }

  exportJSON(): SerializedBackgroundNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      offsetX: self._offsetX,
      offsetY: self._offsetY,
      zoom: self._zoom,
      type: 'background-node',
      version: 1,
    };
  }

}

export function $createBackgroundNode(offsetX: number, offsetY: number, zoom: number) {
  return new BackgroundNode(offsetX, offsetY, zoom)
}

export function $isBackgroundNode(
  node: WhiteboardNode | null | undefined,
): node is BackgroundNode {
  return node instanceof BackgroundNode;
}

