import {NodeKey, NodeMap, TabManagerNode} from "./TabManagerNode";
import {readTabManagerState} from "./TabManagerUpdates";
import {$getRoot} from "./TabManagerUtils";
import invariant from "shared/invariant";
import {$isElementNode} from ".";
import {TabManager} from "./TabManager";

import type {SerializedRootNode} from "./nodes/RootNode";
import {$createRootNode} from "./nodes/RootNode";


export interface SerializedTabManagerState {
    root: SerializedRootNode;
}

export function cloneTabManagerState(current: TabManagerState): TabManagerState {
    return new TabManagerState(new Map(current._nodeMap));
}

export function createEmptyTabManagerState(): TabManagerState {
    return new TabManagerState(new Map([['root', $createRootNode()]]));
}

function exportNodeToJSON<SerializedNode>(node: TabManagerNode): SerializedNode {
    const serializedNode = node.exportJSON();
    const nodeClass = node.constructor;

    // @ts-expect-error TODO Replace Class utility type with InstanceType
    if (serializedNode.type !== nodeClass.getType()) {
        invariant(
            false,
            'TabManagerNode: Node %s does not implement .exportJSON().',
            nodeClass.name,
        );
    }

    // @ts-expect-error TODO Replace Class utility type with InstanceType
    const serializedChildren = serializedNode.children;

    if ($isElementNode(node)) {
        if (!Array.isArray(serializedChildren)) {
            invariant(
                false,
                'TabManagerNode: Node %s is an element but .exportJSON() does not have a children array.',
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

export function tabManagerStateHasDirtySelection(
    tabManagerState: TabManagerState,
    tabManager: TabManager,
): boolean {
    const currentSelection = tabManager.getTabManagerState()._selectionKey;

    const pendingSelection = tabManagerState._selectionKey;

    // Check if we need to update because of changes in selection
    if (pendingSelection !== null && pendingSelection !== currentSelection) {
        return true;
    } else if (currentSelection !== null) {
        return true;
    }

    return false;
}

export class TabManagerState {
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
        return  readTabManagerState(this, callbackFn)
    }

    clone(
        selection?: NodeKey | null,
    ): TabManagerState {
        const tabManagerState = new TabManagerState(
            this._nodeMap,
            selection === undefined ? this._selectionKey : selection,
        );

        return tabManagerState;
    }


    toJSON(): SerializedTabManagerState {
        return readTabManagerState(this, () => ({
            root: exportNodeToJSON($getRoot()),
        }));
    }

}
