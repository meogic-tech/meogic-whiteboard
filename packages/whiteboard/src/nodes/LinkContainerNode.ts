import { ElementNode, SerializedElementNode } from "./ElementNode";
import { Spread, Whiteboard, WhiteboardConfig } from "../Whiteboard";
import { WhiteboardNode } from "../WhiteboardNode";


export type SerializedLinkContainerNode = Spread<
  {
    type: 'link-container-node'
  },
  SerializedElementNode
  >;

export class LinkContainerNode extends ElementNode{
  static getType(): string {
    return 'link-container-node'
  }

  static clone(node: LinkContainerNode): LinkContainerNode {
    const linkContainerNode = new LinkContainerNode(node.__key)
    return linkContainerNode
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
      type: 'link-container-node',
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
