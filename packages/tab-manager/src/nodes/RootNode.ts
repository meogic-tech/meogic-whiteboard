import type {SerializedElementNode} from "./ElementNode";
import {ElementNode} from "./ElementNode";
import {TabManagerNode} from "../TabManagerNode";
import { TabManager, TabManagerConfig } from "../TabManager";

export type SerializedRootNode = SerializedElementNode

export class RootNode extends ElementNode{
    static getType(): string {
        return 'root';
    }


    static clone(node: RootNode): RootNode {
        return new RootNode();
    }


    constructor() {
        super('root');
    }

    //region getters

    //endregion

    //region mutators

    //endregion

    //region DOM
    createDOM(config: TabManagerConfig, tabManager: TabManager): HTMLElement {
        const div = document.createElement('div')
        div.style.position = 'relative'
        return div
    }
    updateDOM(prevNode: RootNode, dom: HTMLElement): boolean {
        return false;
    }
    //endregion

    //region json
    static importJSON(serializedNode: SerializedRootNode): RootNode {
        const node = $createRootNode();
        return node;
    }

    exportJSON(): SerializedRootNode {
        return {
            ...super.exportJSON(),
            type: 'root',
            version: 1,
        };
    }
    //endregion

    isRoot(): boolean {
        return true;
    }
}

export function $createRootNode() {
    return new RootNode()
}

export function $isRootNode(
    node: TabManagerNode | null | undefined,
): node is RootNode {
    return node?.getKey() === 'root';
}
