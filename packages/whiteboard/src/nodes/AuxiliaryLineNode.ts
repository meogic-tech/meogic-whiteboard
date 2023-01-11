import {
  ElementNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  Whiteboard,
  WhiteboardConfig, WhiteboardNode
} from "../";


export type SerializedAuxiliaryLineNode = Spread<
  {
    sourceKey: NodeKey | undefined,
    targetKey: NodeKey | undefined
  },
  SerializedElementNode
  >;



export class AuxiliaryLineNode extends ElementNode {
  static getType(): string {
    return 'auxiliary-line-node'
  }

  static clone(node: AuxiliaryLineNode): AuxiliaryLineNode {
    const auxiliaryLineNode = new AuxiliaryLineNode(node._sourceKey, node._targetKey, node.__key)
    return auxiliaryLineNode
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

  getSourceKey(): NodeKey | undefined{
    const self = this.getLatest()
    return self._sourceKey
  }

  getTargetKey(): NodeKey | undefined{
    const self = this.getLatest()
    return self._targetKey
  }

  setSourceKey(sourceKey: NodeKey | undefined){
    const self = this.getWritable()
    self._sourceKey = sourceKey
  }

  setTargetKey(targetKey: NodeKey | undefined){
    const self = this.getWritable()
    self._targetKey = targetKey
  }


  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    throw new Error('no implement')
  }


  updateDOM(prevNode: AuxiliaryLineNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: AuxiliaryLineNode, dom: HTMLElement, config: WhiteboardConfig) {

  }
  //endregion

  //region json
  static importJSON(serializedNode: SerializedAuxiliaryLineNode): AuxiliaryLineNode {
    const node = $createAuxiliaryLineNode(serializedNode.sourceKey, serializedNode.targetKey);
    return node;
  }

  exportJSON(): SerializedAuxiliaryLineNode {
    const self = this.getLatest();
    return {
      ...super.exportJSON(),
      sourceKey: self._sourceKey,
      targetKey: self._targetKey,
      type: 'auxiliary-line-node',
      version: 1,
    };
  }

  //endregion

}

export function $createAuxiliaryLineNode(sourceKey: NodeKey | undefined, targetKey: NodeKey | undefined) {
  return new AuxiliaryLineNode(sourceKey, targetKey)
}

export function $isAuxiliaryLineNode(
  node: WhiteboardNode | null | undefined,
): node is AuxiliaryLineNode {
  return node instanceof AuxiliaryLineNode;
}
