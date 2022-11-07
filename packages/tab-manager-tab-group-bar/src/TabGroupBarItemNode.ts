import {
    NodeKey,
    SerializedElementNode,
    SerializedTabManagerNode,
    Spread,
    TabManager,
    TabManagerNode,
    COMMAND_PRIORITY_TAB_MANAGER,
    TabManagerConfig,
    CLOSE_TAB_COMMAND,
    getCachedClassNameArray, ACTIVE_TAB_COMMAND,
} from "@meogic/tab-manager";
import CloseSvg from './assets/close.svg'


export type SerializedTabGroupBarItemNode = Spread<{
    active: boolean,
    bindTabNodeKey: NodeKey,
    name: string | undefined
}, SerializedTabManagerNode>

export class TabGroupBarItemNode extends TabManagerNode {
    static getType(): string {
        return 'tab-group-bar-item';
    }

    static clone(node: TabGroupBarItemNode): TabGroupBarItemNode {
        const tabGroupBarItemNode = new TabGroupBarItemNode(node.__bindTabNodeKey, node.__name, node.__active, node.__key)
        return tabGroupBarItemNode;
    }

    protected __active: boolean;
    protected __bindTabNodeKey: NodeKey;
    protected __name: string | undefined;

    constructor(bindTabNodeKey: NodeKey,
                name?: string,
                active?: boolean,
                key?: NodeKey) {
        super(key);
        this.__active = active ?? false;
        this.__bindTabNodeKey = bindTabNodeKey
        this.__name = name
    }

    //region getter
    getActive(): boolean {
        const self = this.getLatest();
        return self.__active;
    }

    getBindTabNodeKey(): NodeKey {
        const self = this.getLatest();
        return self.__bindTabNodeKey;
    }

    getName(): string | undefined{
        const self = this.getLatest();
        return self.__name;
    }

    //endregion

    //region mutation
    setActive(active: boolean): this {
        const self = this.getWritable();
        self.__active = active;
        return self
    }

    setBindTabNodeKey(bindTabNodeKey: NodeKey): this {
        const self = this.getWritable();
        self.__bindTabNodeKey = bindTabNodeKey;
        return self
    }

    setName(name: string | undefined): this {
        const self = this.getWritable();
        self.__name = name;
        return self
    }

    //endregion

    //region DOM
    createDOM(_config: TabManagerConfig, _tabManager: TabManager): HTMLElement {
        const self = this.getLatest();
        const div = document.createElement('div')
        div.addEventListener('mousedown', () => {
            _tabManager.dispatchCommand(ACTIVE_TAB_COMMAND, {
                tabNodeKey: self.__bindTabNodeKey
            })
        })
        let resultClassNames = []
        const classNames: string[] | undefined = getCachedClassNameArray(_config.theme, 'tab-group-bar-item');
        if (classNames !== undefined) {
            resultClassNames.push(...classNames)
        }
        if (self.getActive()) {
            const activeClassNames = getCachedClassNameArray(_config.theme, 'active')
            if(activeClassNames){
                resultClassNames.push(...activeClassNames)
            }
        }
        const domClassList = div.classList
        domClassList.add(...resultClassNames)

        // text
        const textDiv = document.createElement("div")
        if(getCachedClassNameArray(_config.theme, 'tab-group-bar-item-text')){
            textDiv.classList.add(...getCachedClassNameArray(_config.theme, 'tab-group-bar-item-text'))
        }
        textDiv.innerText = self.getName() ?? 'Untitled'
        div.append(textDiv)
        // button
        const button = document.createElement("button")
        if(getCachedClassNameArray(_config.theme, 'tab-group-bar-item-button')){
            button.classList.add(...getCachedClassNameArray(_config.theme, 'tab-group-bar-item-button'))
        }
        button.innerHTML = `<img src="${CloseSvg}" alt="close"/>`
        button.addEventListener('click', (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            _tabManager.dispatchCommand(CLOSE_TAB_COMMAND, self.__bindTabNodeKey)
        })
        div.append(button)
        return div
    }

    updateDOM(_prevNode: TabGroupBarItemNode, _dom: HTMLElement, _config: TabManagerConfig): boolean {
        const self = this.getLatest();
        return self.__active !== _prevNode.__active || self.__name !== _prevNode.__name
    }

    //endregion

    //region json
    static importJSON(serializedNode: SerializedTabGroupBarItemNode): TabGroupBarItemNode {
        const node = $createTabGroupBarItemNode(
            serializedNode.bindTabNodeKey,
            serializedNode.name,
            serializedNode.active);
        return node;
    }

    exportJSON(): SerializedTabGroupBarItemNode {
        return {
            bindTabNodeKey: this.getBindTabNodeKey(),
            name: this.getName(),
            active: this.getActive(),
            type: 'tab-group-bar-item',
            version: 1,
        };
    }

    //endregion

}


export function $createTabGroupBarItemNode(bindNodeKey: NodeKey, name?: string, active?: boolean) {
    return new TabGroupBarItemNode(bindNodeKey, name, active)
}


export function $isTabGroupBarItemNode(
    node: TabManagerNode | null | undefined,
): node is TabGroupBarItemNode {
    return node instanceof TabGroupBarItemNode;
}
