import { ElementNode, SerializedElementNode } from "./ElementNode";
import { Spread, Whiteboard, WhiteboardConfig } from "../Whiteboard";
import { WhiteboardNode } from "../WhiteboardNode";


export type SerializedLinkContainerNode = Spread<
  {
    type: 'container-node'
  },
  SerializedElementNode
  >;

export class LinkContainerNode extends ElementNode{
  static getType(): string {
    return 'container-node'
  }

  static clone(node: LinkContainerNode): LinkContainerNode {
    const linkContainerNode = new LinkContainerNode(node.__key)
    return linkContainerNode
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const div = document.createElementNS(svgNS, 'g')
    // @ts-ignore
    return div
  }

  updateDOM(prevNode: LinkContainerNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: LinkContainerNode, dom: HTMLElement, config: WhiteboardConfig): void {

  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedLinkContainerNode): LinkContainerNode {
    const node = $createLinkContainerNode();
    return node;
  }

  exportJSON(): SerializedLinkContainerNode {
    return {
      ...super.exportJSON(),
      type: 'container-node',
      version: 1,
    };
  }

  //endregion

}

export function $createLinkContainerNode() {
  return new LinkContainerNode()
}

export function $isLinkContainerNode(
  node: WhiteboardNode | null | undefined,
): node is LinkContainerNode {
  return node instanceof LinkContainerNode;
}
