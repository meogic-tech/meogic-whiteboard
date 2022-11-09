import {
  $createViewportNode, $getNodeByKey,
  ElementNode,
  NodeKey,
  SerializedElementNode, ShapeNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from "@meogic/whiteboard";
import { SerializedViewportNode } from "./ViewportNode";
import { getCenter } from "../WhiteboardUtils";


export type SerializedLinkNode = Spread<
  {
    sourceKey: NodeKey | undefined,
    targetKey: NodeKey | undefined
  },
  SerializedElementNode
  >;



export class LinkNode extends ElementNode {
  static getType(): string {
    return 'link-node'
  }

  static clone(node: LinkNode): LinkNode {
    const containerNode = new LinkNode(node._sourceKey, node._targetKey, node.__key)
    return containerNode
  }

  _sourceKey: NodeKey | undefined
  _targetKey: NodeKey | undefined
  _sourceX: number
  _sourceY: number
  _targetX: number
  _targetY: number


  constructor(sourceKey: NodeKey | undefined, targetKey: NodeKey | undefined, key?: NodeKey) {
    super(key);
    this._sourceKey = sourceKey;
    this._targetKey = targetKey;
    this._sourceX = 0
    this._sourceY = 0
    this._targetX = 0
    this._targetY = 0
  }

  $setNewPosition() {
    const sourceKey = this.getLatest()._sourceKey
    const targetKey = this.getLatest()._targetKey
    if(!sourceKey || !targetKey){
      return;
    }
    const sourceNode = $getNodeByKey(sourceKey) as ShapeNode
    const targetNode = $getNodeByKey(targetKey) as ShapeNode
    if(!sourceNode || !targetNode){
      console.warn('sourceNode or targetNode not found');
      return
    }
    const pointStart = getCenter(sourceNode._x, sourceNode._y, sourceNode._width, sourceNode._height)
    this.getWritable()._sourceX = pointStart.x
    this.getWritable()._sourceY = pointStart.y
    const pointEnd = getCenter(targetNode._x, targetNode._y, targetNode._width, targetNode._height)
    this.getWritable()._targetX = pointEnd.x
    this.getWritable()._targetY = pointEnd.y
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('stroke-width', '10')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'yellow')

    if(this._sourceKey && this._targetKey){
      this.$setNewPosition()
      path.setAttribute('d', `M ${this.getLatest()._sourceX} ${this.getLatest()._sourceY} L ${this.getLatest()._sourceX} ${this.getLatest()._sourceY} L ${this.getLatest()._targetX} ${this.getLatest()._targetY}`)
    }
    // @ts-ignore
    return path
  }


  updateDOM(prevNode: LinkNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: LinkNode, dom: HTMLElement, config: WhiteboardConfig) {
    if(this._sourceX !== prevNode._sourceX
      || this._sourceY !== prevNode._sourceY
      || this._targetX !== prevNode._targetX
      || this._targetY !== prevNode._targetY
    ){
      dom.setAttribute('d', `M ${this._sourceX} ${this._sourceY} L ${this._sourceX} ${this._sourceY} L ${this._targetX} ${this._targetY}`)
    }

  }
  //endregion

  //region json
  static importJSON(serializedNode: SerializedLinkNode): LinkNode {
    const node = $createLinkNode(serializedNode.sourceKey, serializedNode.targetKey);
    return node;
  }

  exportJSON(): SerializedLinkNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      sourceKey: self._sourceKey,
      targetKey: self._targetKey,
      type: 'link-node',
      version: 1,
    };
  }

  //endregion

}

export function $createLinkNode(sourceKey: NodeKey | undefined, targetKey: NodeKey | undefined) {
  return new LinkNode(sourceKey, targetKey)
}

export function $isLinkNode(
  node: WhiteboardNode | null | undefined,
): node is LinkNode {
  return node instanceof LinkNode;
}
