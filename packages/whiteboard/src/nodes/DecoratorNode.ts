import {Whiteboard, WhiteboardConfig} from "../Whiteboard";
import {NodeKey, WhiteboardNode} from "../WhiteboardNode";
import invariant from "shared/invariant";

export class DecoratorNode<T> extends WhiteboardNode {
    constructor(key?: NodeKey) {
        super(key);
    }

    decorate(whiteboard: Whiteboard, config: WhiteboardConfig): T {
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
    node: WhiteboardNode | null | undefined,
): node is DecoratorNode<T> {
    return node instanceof DecoratorNode;
}
