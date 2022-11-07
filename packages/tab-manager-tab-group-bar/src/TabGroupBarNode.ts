import {
    ADD_TAB_COMMAND,
    ElementNode,
    NodeKey,
    SerializedElementNode,
    Spread,
    TabManager,
    TabManagerNode
} from "@meogic/tab-manager";
import invariant from "shared/invariant";
import {getCachedClassNameArray} from "@meogic/tab-manager";
import {TabManagerConfig} from "@meogic/tab-manager";
import {$isTabGroupNode} from "@meogic/tab-manager";


export type SerializedTabGroupBarNode = Spread<
    {

    }, SerializedElementNode
    >

export class TabGroupBarNode extends ElementNode {


    getActiveTabGroupBarItemNodeKey(): NodeKey | undefined {
        return this.__activeTabGroupBarItemNodeKey;
    }

    setActiveTabGroupBarItemNodeKey(value: NodeKey) {
        const self = this.getLatest();
        self.setActiveTabGroupBarItemNodeKey(value)
    }
    static getType(): string {
        return 'tab-group-bar';
    }

    static clone(node: TabGroupBarNode): TabGroupBarNode {
        const tabGroupBarNode = new TabGroupBarNode(node.__key)
        return tabGroupBarNode;
    }
    protected __activeTabGroupBarItemNodeKey: NodeKey | undefined
    //region DOM
    createDOM(_config: TabManagerConfig, _tabManager: TabManager): HTMLElement {
        const div = document.createElement('div')

        const classNames: string[] = getCachedClassNameArray(_config.theme, 'tab-group-bar');
        if( classNames !== undefined){
            const domClassList = div.classList
            domClassList.add(...classNames)
        }
        const self = this.getLatest()
        const parent = self.getParent() as TabManagerNode
        if(!$isTabGroupNode(parent)){
            invariant(
                !$isTabGroupNode(parent),
                'TabGroupBar should be in the tabGroup'
            )
            return div
        }


        return div
    }

    updateDOM(prevNode: TabGroupBarNode, _dom: HTMLElement, _config: TabManagerConfig): boolean {
        const self = this.getLatest();
        return prevNode.getChildrenSize() !== self.getChildrenSize();
    }

//endregion


    //region json
    static importJSON(serializedNode: SerializedTabGroupBarNode): TabGroupBarNode {
        const node = $createTabGroupBarNode();
        return node;
    }

    exportJSON(): SerializedTabGroupBarNode {
        return {
            ...super.exportJSON(),
            type: 'tab-group-bar',
            version: 1,
        };
    }

    //endregion
}
export function $createTabGroupBarNode() {
    return new TabGroupBarNode()
}

export function $isTabGroupBarNode(
    node: TabManagerNode | null | undefined,
): node is TabGroupBarNode {
    return node instanceof TabGroupBarNode;
}
