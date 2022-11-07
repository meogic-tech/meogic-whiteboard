import {TabGroupNode} from "@meogic/tab-manager";
import type {SerializedTabGroupNode} from "@meogic/tab-manager";
import {
    NodeKey,
    SerializedElementNode,
    Spread,
    TabManager,
    TabManagerConfig,
    TabManagerNode
} from "@meogic/tab-manager";


export type SerializedResizableTabGroupNode = Spread<
    {
        resizing: boolean;
        width: number;
    },
    SerializedTabGroupNode
    >;

export class ResizableTabGroupNode extends TabGroupNode{

    static getType(): string {
        return 'resizable-tab-group';
    }

    static clone(node: ResizableTabGroupNode): ResizableTabGroupNode {
        const tabGroupNode = new ResizableTabGroupNode(node.__key)
        tabGroupNode.__percent = node.__percent
        tabGroupNode.__resizing = node.__resizing
        tabGroupNode.__width = node.__width
        tabGroupNode.__active = node.__active
        return tabGroupNode;
    }

    protected __resizing: boolean;
    protected __width: number;

    constructor(key?: NodeKey, percent?: number) {
        super(key, percent);
        this.__resizing = false;
        this.__width = 0;
    }
    //region getters
    getResizing(): boolean {
        const self = this.getLatest();
        return self.__resizing;
    }

    getWidth(): number {
        const self = this.getLatest();
        return self.__width;
    }
    //endregion
    //region mutation
    setResizing(value: boolean) {
        const self = this.getWritable();
        self.__resizing = value;
    }

    setWidth(value: number) {
        const self = this.getWritable();
        self.__width = value;
    }
    //endregion

    //region DOM
    createDOM(config: TabManagerConfig, tabManager: TabManager): HTMLElement {
        const div = super.createDOM(config, tabManager)
        if(this.getResizing()){
            div.style.flexGrow = 'inherit'
            div.style.flex = '0 0 auto'
            div.style.width = this.getWidth() + 'px'
        }
        return div
    }
    updateDOM(prevNode: ResizableTabGroupNode, dom: HTMLElement, config: TabManagerConfig): boolean {
        const self = this.getLatest();
        return super.updateDOM(prevNode, dom, config)
            || prevNode.__resizing !== self.__resizing
            || prevNode.__width !== self.__width
            ;
    }
    //endregion

    //region JSON
    static importJSON(serializedNode: SerializedResizableTabGroupNode): TabGroupNode {
        const node = $createResizableTabGroupNode();
        node.setPercent(serializedNode.percent)
        node.setResizing(serializedNode.resizing)
        node.setWidth(serializedNode.width)
        node.setActive(serializedNode.active)
        return node;
    }

    exportJSON(): SerializedResizableTabGroupNode {
        return {
            ...super.exportJSON(),
            resizing: this.getResizing(),
            width: this.getWidth(),
            type: 'resizable-tab-group',
            version: 1,
        };
    }

    //endregion
}

export function $createResizableTabGroupNode() {
    return new ResizableTabGroupNode()
}

export function $isResizableTabGroupNode(
    node: TabManagerNode | null | undefined,
): node is ResizableTabGroupNode {
    return node instanceof ResizableTabGroupNode;
}
