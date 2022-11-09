import {NodeKey, NodeMap, WhiteboardNode} from "./WhiteboardNode";
import {readWhiteboardState} from "./WhiteboardUpdates";
import {$getRoot} from "./WhiteboardUtils";
import invariant from "shared/invariant";
import {$isElementNode} from ".";
import {Whiteboard} from "./Whiteboard";

import type {SerializedRootNode} from "./nodes/RootNode";
import {$createRootNode} from "./nodes/RootNode";


export interface SerializedWhiteboardState {
    root: SerializedRootNode;
}

export function cloneWhiteboardState(current: WhiteboardState): WhiteboardState {
    return new WhiteboardState(new Map(current._nodeMap));
}

export function createEmptyWhiteboardState(): WhiteboardState {
    return new WhiteboardState(new Map([['root', $createRootNode()]]));
}

function exportNodeToJSON<SerializedNode>(node: WhiteboardNode): SerializedNode {
    const serializedNode = node.exportJSON();
    const nodeClass = node.constructor;

    // @ts-expect-error TODO Replace Class utility type with InstanceType
    if (serializedNode.type !== nodeClass.getType()) {
        invariant(
            false,
            'WhiteboardNode: Node %s does not implement .exportJSON().',
            nodeClass.name,
        );
    }

    // @ts-expect-error TODO Replace Class utility type with InstanceType
    const serializedChildren = serializedNode.children;

    if ($isElementNode(node)) {
        if (!Array.isArray(serializedChildren)) {
            invariant(
                false,
                'WhiteboardNode: Node %s is an element but .exportJSON() does not have a children array.',
                nodeClass.name,
            );
        }

        const children = node.getChildren();

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const serializedChildNode = exportNodeToJSON(child);
            serializedChildren.push(serializedChildNode);
        }
    }

    // @ts-expect-error
    return serializedNode;
}

export function whiteboardStateHasDirtySelection(
    whiteboardState: WhiteboardState,
    whiteboard: Whiteboard,
): boolean {
    const currentSelection = whiteboard.getWhiteboardState()._selectionKey;

    const pendingSelection = whiteboardState._selectionKey;

    // Check if we need to update because of changes in selection
    if (pendingSelection !== null && pendingSelection !== currentSelection) {
        return true;
    } else if (currentSelection !== null) {
        return true;
    }

    return false;
}

export class WhiteboardState {
    _nodeMap: NodeMap;
    _selectionKey: NodeKey | null

    constructor(
        nodeMap: NodeMap,
        selectionKey?: NodeKey | null
    ) {
        this._nodeMap = nodeMap
        this._selectionKey = selectionKey || null;
    }

    isEmpty(): boolean {
        return this._nodeMap.size === 1 && this._selectionKey === null;
    }

    read<V>(callbackFn: () => V): V {
        return  readWhiteboardState(this, callbackFn)
    }

    clone(
        selection?: NodeKey | null,
    ): WhiteboardState {
        const whiteboardState = new WhiteboardState(
            this._nodeMap,
            selection === undefined ? this._selectionKey : selection,
        );

        return whiteboardState;
    }


    toJSON(): SerializedWhiteboardState {
        return readWhiteboardState(this, () => ({
            root: exportNodeToJSON($getRoot()),
        }));
    }

}
