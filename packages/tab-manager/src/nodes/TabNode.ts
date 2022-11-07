import {NodeKey, SerializedTabManagerNode, TabManagerNode} from "../TabManagerNode";
import {Spread, TabManagerConfig} from "../TabManager";
import {getCachedClassNameArray} from "../TabManagerUtils";
import {DecoratorNode} from "./DecoratorNode";

export type SerializedTabNode = Spread<
    {
        name: string | undefined,
        active: boolean
    },
    SerializedTabManagerNode
    >;


export class TabNode<T> extends DecoratorNode<T>{
    static getType(): string {
        return 'tab';
    }


    protected __active: boolean;
    protected __name: string | undefined;

    constructor(name?: string, active?: boolean, key?: NodeKey) {
        super(key);
        this.__active = active ?? false
        this.__name = name
    }
    //region getters
    getActive(): boolean {
        const self = this.getLatest();
        return self.__active;
    }
    getName(): string | undefined {
        const self = this.getLatest();
        return self.__name;
    }
    //endregion

    //region mutators
    setActive(value: boolean): this{
        const self = this.getWritable();
        self.__active = value;
        return this
    }
    setName(value: string): this {
        const self = this.getWritable();
        self.__name = value;
        return this
    }
    //endregion

    //region DOM
    createDOM(config: TabManagerConfig): HTMLElement {
        const self = this.getLatest();
        const div = document.createElement('div')
        const classNames: string[] = getCachedClassNameArray(config.theme, 'tab');
        if( classNames !== undefined){
            const domClassList = div.classList
            domClassList.add(...classNames)
        }
        if(self.getActive()){
            div.style.display = 'block'
        }else{
            div.style.display = 'none'
        }
        return div
    }
    updateDOM(prevNode: TabNode<T>, dom: HTMLElement): boolean {
        const self = this.getLatest();
        return prevNode.__active !== self.__active;
    }
    //endregion

    //region json
    /*static importJSON<T>(serializedNode: SerializedDecoratorTabNode): DecoratorTabNode<T> {
        const node = $createDecoratorTabNode(serializedNode.name, serializedNode.active);
        return node;
    }

    exportJSON(): SerializedDecoratorTabNode {
        return {
            ...super.exportJSON(),
            name: this.getName(),
            active: this.getActive(),
            type: 'tab',
            version: 1,
        };
    }*/
    //endregion

}

export function $isTabNode(
    node: TabManagerNode | null | undefined,
): node is TabNode<unknown> {
    return node instanceof TabNode;
}
