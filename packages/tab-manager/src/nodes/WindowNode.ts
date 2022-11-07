import {ElementNode, SerializedElementNode} from "../";
import {Spread, TabManagerConfig} from "../TabManager";
import {NodeKey, SerializedTabManagerNode, TabManagerNode} from "../TabManagerNode";
import {getCachedClassNameArray} from "../TabManagerUtils";

export type SerializedWindowNode = Spread<
    {
        direction: 'vertical' | 'horizontal' | null;
        percent: number
    },
    SerializedElementNode
    >;

export class WindowNode extends ElementNode{
    static getType(): string {
        return 'window';
    }


    /**
     * 这里不能用set语法
     * @param node
     */
    static clone(node: WindowNode): WindowNode {
        const windowNode = new WindowNode(node.__key)
        windowNode.__direction = node.__direction
        windowNode.__percent = node.__percent
        return windowNode;
    }

    private __direction: 'vertical' | 'horizontal' | null;

    /**
     * 从0到100
     * @private
     */
    private __percent: number;


    constructor(key?: NodeKey,
                direction?: 'vertical' | 'horizontal' | null,
                percent?: number) {
        super(key);
        this.__direction = direction ?? 'horizontal';
        this.__percent = percent ?? 100;
    }

    //region getters
    getDirection(): "vertical" | "horizontal" | null {
        const self = this.getLatest();
        return self.__direction;
    }
    getPercent(): number {
        const self = this.getLatest();
        return self.__percent;
    }

    //endregion

    //region mutators

    setDirection(direction: "vertical" | "horizontal" | null) {
        const self = this.getWritable();
        self.__direction = direction;
    }
    setPercent(percent: number){
        const self = this.getLatest();
        self.__percent = percent;
    }
    //endregion

    //region DOM
    createDOM(config: TabManagerConfig): HTMLElement {
        const div = document.createElement('div')
        const self = this.getLatest();
        if(self.getDirection() === 'horizontal'){
            div.style.display = 'flex';
            div.style.flexDirection = 'row';
        }
        if(self.getDirection() === 'vertical'){
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
        }

        const classNames: string[] = getCachedClassNameArray(config.theme, 'window');
        if( classNames !== undefined){
            const domClassList = div.classList
            domClassList.add(...classNames)
        }
        return div
    }
    updateDOM(prevNode: WindowNode, dom: HTMLElement): boolean {
        const self = this.getLatest();
        return prevNode.getDirection() !== self.getDirection();
    }
    //endregion

    //region json
    static importJSON(serializedNode: SerializedWindowNode): WindowNode {
        const node = $createWindowNode();
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedWindowNode {
        return {
            ...super.exportJSON(),
            direction: this.getDirection(),
            percent: this.getPercent(),
            type: 'window',
            version: 1,
        };
    }
    //endregion
}

export function $createWindowNode() {
    return new WindowNode()
}

export function $isWindowNode(
    node: TabManagerNode | null | undefined,
): node is WindowNode {
    return node instanceof WindowNode;
}
