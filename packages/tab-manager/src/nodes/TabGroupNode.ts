import {Spread, TabManager,TabManagerConfig} from '../TabManager';
import {NodeKey,TabManagerNode} from '../TabManagerNode';
import {getCachedClassNameArray} from '../TabManagerUtils';
import {ElementNode,SerializedElementNode} from './ElementNode';


export type SerializedTabGroupNode = Spread<
    {
        percent: number;
    },
    SerializedElementNode
    >;


export class TabGroupNode extends ElementNode{
    static getType(): string {
        return 'tab-group';
    }

    static clone(node: TabGroupNode): TabGroupNode {
        const tabGroupNode = new TabGroupNode(node.__key)
        tabGroupNode.__percent = node.__percent
        return tabGroupNode;
    }

    /**
     * 从0到100
     * @private
     */
    protected __percent: number;


    constructor(key?: NodeKey,
                percent?: number) {
        super(key);
        this.__percent = percent ?? 100;
    }
    //region getters
    getPercent(): number {
        const self = this.getLatest();
        return self.__percent;
    }

    //endregion

    //region mutators
    setPercent(percent: number): this{
        const self = this.getWritable();
        self.__percent = percent;
        return this
    }
    //endregion

    //region DOM
    createDOM(config: TabManagerConfig, tabManager: TabManager): HTMLElement {
        const self = this.getLatest();
        const div = document.createElement('div')
        const classNames: string[] = getCachedClassNameArray(config.theme, 'tab-group');
        if( classNames !== undefined){
            const domClassList = div.classList
            domClassList.add(...classNames)
        }
        div.style.flexGrow = self.getPercent() + ''
        if(self.getActive()){
            const activeClassNames: string[] = getCachedClassNameArray(config.theme, 'active');
            if( activeClassNames !== undefined){
                const domClassList = div.classList
                domClassList.add(...activeClassNames)
            }
        }


        // resize-handle
        const resizeHandle = document.createElement('div')
        const resizeHandleClassNames: string[] = getCachedClassNameArray(config.theme, 'tab-group-resize-handle');
        if( resizeHandleClassNames !== undefined){
            const domClassList = resizeHandle.classList
            domClassList.add(...resizeHandleClassNames)
        }
        resizeHandle.setAttribute('data-tab-manager-resize-handle', 'true')
        div.append(resizeHandle)
        return div
    }
    updateDOM(prevNode: TabGroupNode, dom: HTMLElement, config: TabManagerConfig): boolean {
        const self = this.getLatest();
        return super.updateDOM(prevNode, dom, config)
            || prevNode.getChildrenSize() !== self.getChildrenSize()
            || prevNode.__percent !== self.__percent;
    }

    //endregion

    //region json
    static importJSON(serializedNode: SerializedTabGroupNode): TabGroupNode {
        const node = $createTabGroupNode();
        node.setPercent(serializedNode.percent)
        return node;
    }

    exportJSON(): SerializedTabGroupNode {
        return {
            ...super.exportJSON(),
            percent: this.getPercent(),
            type: 'tab-group',
            version: 1,
        };
    }

    //endregion

}

export function $createTabGroupNode() {
    return new TabGroupNode()
}

export function $isTabGroupNode(
    node: TabManagerNode | null | undefined,
): node is TabGroupNode {
    return node instanceof TabGroupNode;
}
