import { ElementNode, SerializedElementNode } from "./ElementNode";
import { Spread, Whiteboard, WhiteboardConfig } from "../Whiteboard";
import { WhiteboardNode } from "../WhiteboardNode";


export type SerializedContainerNode = Spread<
  {
    type: 'container-node'
  },
  SerializedElementNode
  >;

export class ContainerNode extends ElementNode{
  static getType(): string {
    return 'container-node'
  }

  static clone(node: ContainerNode): ContainerNode {
    const containerNode = new ContainerNode(node.__key)
    return containerNode
  }

  //region DOM
  createDOM(config: WhiteboardConfig, whiteboard: Whiteboard): HTMLElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const div = document.createElement('div')
    div.style.width = '100%'
    div.style.height = '100%'
    div.style.overflow = 'hidden'
    div.style.position = 'relative'
    // div.style.left = '0'
    // div.style.top = '0'
    // div.style.right = '0'
    // div.style.bottom = '0'
    // @ts-ignore
    return div
  }

  updateDOM(prevNode: ContainerNode, dom: HTMLElement, config: WhiteboardConfig): boolean {
    return false
  }

  updateDOMProperties(prevNode: ContainerNode, dom: HTMLElement, config: WhiteboardConfig): void {

  }

  //endregion

  //region json
  static importJSON(serializedNode: SerializedContainerNode): ContainerNode {
    const node = $createContainerNode();
    return node;
  }

  exportJSON(): SerializedContainerNode {
    return {
      ...super.exportJSON(),
      type: 'container-node',
      version: 1,
    };
  }

  //endregion

}

export function $createContainerNode() {
  return new ContainerNode()
}

export function $isContainerNode(
  node: WhiteboardNode | null | undefined,
): node is ContainerNode {
  return node instanceof ContainerNode;
}
