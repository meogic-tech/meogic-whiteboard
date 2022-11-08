import { ElementNode, SerializedElementNode } from "./ElementNode";
import { Spread, TabManager, TabManagerConfig } from "../TabManager";
import { TabManagerNode } from "@meogic/tab-manager";


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
  createDOM(config: TabManagerConfig, tabManager: TabManager): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const div = document.createElementNS(svgNS, 'g')
    return div
  }

  updateDOM(prevNode: LinkContainerNode, dom: HTMLElement, config: TabManagerConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: LinkContainerNode, dom: HTMLElement, config: TabManagerConfig): boolean {

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
  node: TabManagerNode | null | undefined,
): node is LinkContainerNode {
  return node instanceof LinkContainerNode;
}
