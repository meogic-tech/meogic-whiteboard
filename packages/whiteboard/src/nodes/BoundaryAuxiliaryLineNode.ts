import {
  $getNodeByKey, getCenter,
  NodeKey,
  SerializedElementNode, ShapeNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from "../";
import { AuxiliaryLineNode, SerializedAuxiliaryLineNode } from "./AuxiliaryLineNode";


export type SerializedBoundaryAuxiliaryLineNode = Spread<
  {
    sourceBoundary: 'top' | 'bottom' | 'left' | 'right',
    targetBoundary: 'top' | 'bottom' | 'left' | 'right'
  },
  SerializedAuxiliaryLineNode
  >;



export class BoundaryAuxiliaryLineNode extends AuxiliaryLineNode {
  static getType(): string {
    return 'boundary-auxiliary-line-node'
  }

  static clone(node: BoundaryAuxiliaryLineNode): BoundaryAuxiliaryLineNode {
    const boundaryAuxiliaryLineNode = new BoundaryAuxiliaryLineNode(node._sourceKey, node._targetKey, node._sourceBoundary, node._targetBoundary, node.__key)
    return boundaryAuxiliaryLineNode
  }

  _sourceBoundary: 'top' | 'bottom' | 'left' | 'right'
  _targetBoundary: 'top' | 'bottom' | 'left' | 'right'
  _sourceX: number
  _sourceY: number
  _targetX: number
  _targetY: number


  constructor(sourceKey: NodeKey | undefined, targetKey: NodeKey | undefined,
              sourceBoundary: 'top' | 'bottom' | 'left' | 'right',
              targetBoundary: 'top' | 'bottom' | 'left' | 'right',
              key?: NodeKey) {
    super(sourceKey, targetKey, key);
    this._sourceBoundary = sourceBoundary
    this._targetBoundary = targetBoundary
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
    if(this._sourceBoundary === 'left' || this._sourceBoundary === 'right'){
      console.log("sourceNode", sourceNode);
      // 当一个是左或者右的时候，那就说明当前边界辅助线是垂直辅助线，所以x很好确定
      this.getWritable()._sourceX = this._sourceBoundary === 'left' ? sourceNode._x : sourceNode._x + sourceNode.getLatest()._width
      this.getWritable()._targetX = this.getWritable()._sourceX

      this.getWritable()._sourceY = sourceNode._y < targetNode._y ? sourceNode._y + sourceNode.getLatest()._height : sourceNode._y
      this.getWritable()._targetY = sourceNode._y < targetNode._y ? targetNode._y : targetNode._y + targetNode.getLatest()._height
    }
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('stroke-width', '10')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'blue')

    if(this._sourceKey && this._targetKey){
      this.$setNewPosition()
      path.setAttribute('d', `M ${this.getLatest()._sourceX} ${this.getLatest()._sourceY} L ${this.getLatest()._sourceX} ${this.getLatest()._sourceY} L ${this.getLatest()._targetX} ${this.getLatest()._targetY}`)
    }
    // @ts-ignore
    return path
  }


  updateDOM(prevNode: BoundaryAuxiliaryLineNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return super.updateDOM(prevNode, dom, config);
  }

  updateDOMProperties(prevNode: BoundaryAuxiliaryLineNode, dom: HTMLElement, config: WhiteboardConfig) {

  }
  //endregion

  //region json
  static importJSON(serializedNode: SerializedBoundaryAuxiliaryLineNode): BoundaryAuxiliaryLineNode {
    const node = $createBoundaryAuxiliaryLineNode(serializedNode.sourceKey, serializedNode.targetKey,
      serializedNode.sourceBoundary, serializedNode.targetBoundary);
    return node;
  }

  exportJSON(): SerializedBoundaryAuxiliaryLineNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      sourceBoundary: self._sourceBoundary,
      targetBoundary: self._targetBoundary,
      type: 'boundary-auxiliary-line-node',
      version: 1,
    };
  }

  //endregion

}

export function $createBoundaryAuxiliaryLineNode(sourceKey: NodeKey | undefined, targetKey: NodeKey | undefined,
                                                 sourceBoundary: 'top' | 'bottom' | 'left' | 'right',
                                                 targetBoundary: 'top' | 'bottom' | 'left' | 'right',) {
  return new BoundaryAuxiliaryLineNode(sourceKey, targetKey, sourceBoundary, targetBoundary)
}

export function $isBoundaryAuxiliaryLineNode(
  node: WhiteboardNode | null | undefined,
): node is BoundaryAuxiliaryLineNode {
  return node instanceof BoundaryAuxiliaryLineNode;
}
