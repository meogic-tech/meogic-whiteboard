import {TabManager, TabManagerConfig} from "../TabManager";
import {NodeKey, TabManagerNode} from "../TabManagerNode";
import invariant from "shared/invariant";

export class DecoratorNode<T> extends TabManagerNode {
    constructor(key?: NodeKey) {
        super(key);
    }

    decorate(tabManager: TabManager, config: TabManagerConfig): T {
        invariant(false, 'decorate: base method not extended');
    }

    isIsolated(): boolean {
        return false;
    }

    isTopLevel(): boolean {
        return false;
    }
}

export function $isDecoratorNode<T>(
    node: TabManagerNode | null | undefined,
): node is DecoratorNode<T> {
    return node instanceof DecoratorNode;
}
