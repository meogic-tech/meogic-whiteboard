import { ElementNode, SerializedElementNode } from "./ElementNode";
import { Spread, Whiteboard, WhiteboardConfig } from "../Whiteboard";
import { WhiteboardNode } from "../WhiteboardNode";


export type SerializedAuxiliaryLineContainerNode = Spread<
  {
    type: 'auxiliary-line-container-node'
  },
  SerializedElementNode
  >;

/**
 * 辅助线容器
 */
export class AuxiliaryLineContainerNode extends ElementNode{
  static getType(): string {
    return 'auxiliary-line-container-node'
  }

  static clone(node: AuxiliaryLineContainerNode): AuxiliaryLineContainerNode {
    const auxiliaryLineContainerNode = new AuxiliaryLineContainerNode(node.__key)
    return auxiliaryLineContainerNode
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.position = 'absolute'
    svg.style.left = '0'
    svg.style.right = '0'
    svg.style.overflow = 'visible';
    // @ts-ignore
    return svg
  }

  updateDOM(prevNode: AuxiliaryLineContainerNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: AuxiliaryLineContainerNode, dom: HTMLElement, config: WhiteboardConfig): void {

  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedAuxiliaryLineContainerNode): AuxiliaryLineContainerNode {
    const node = $createAuxiliaryLineContainerNode();
    return node;
  }

  exportJSON(): SerializedAuxiliaryLineContainerNode {
    return {
      ...super.exportJSON(),
      type: 'auxiliary-line-container-node',
      version: 1,
    };
  }

  //endregion

}

export function $createAuxiliaryLineContainerNode() {
  return new AuxiliaryLineContainerNode()
}

export function $isAuxiliaryLineContainerNode(
  node: WhiteboardNode | null | undefined,
): node is AuxiliaryLineContainerNode {
  return node instanceof AuxiliaryLineContainerNode;
}
