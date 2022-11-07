import type {TabManager, TabManagerConfig} from "./TabManager";
import invariant from 'shared/invariant';
import {$isRootNode, $isElementNode, ElementNode} from ".";
import {$getNodeByKey, $setNodeKey, internalMarkNodeAsDirty, internalMarkSiblingsAsDirty} from "./TabManagerUtils";
import {getActiveTabManager, getActiveTabManagerState} from "./TabManagerUpdates";


export class TabManagerNode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    __type: string;

    // @ts-ignore We set the key in the constructor.
    __key: string;
    __parent: null | NodeKey;


    static getType(): string {
        invariant(
            false,
            'TabManagerNode: Node %s does not implement .getType().',
            this.name,
        );
    }

    static clone(_data: unknown): TabManagerNode {
        invariant(
            false,
            'TabManagerNode: Node %s does not implement .clone().',
            this.name,
        );
    }

    constructor(key?: NodeKey) {
        // @ts-expect-error
        this.__type = this.constructor.getType();
        this.__parent = null;
        $setNodeKey(this, key);
    }

    getType(): string {
        return this.__type;
    }

    isAttached(): boolean {
        let nodeKey: string | null = this.__key;
        while (nodeKey !== null) {
            if (nodeKey === 'root') {
                return true;
            }

            const node: TabManagerNode | null = $getNodeByKey(nodeKey);

            if (node === null) {
                break;
            }
            nodeKey = node.__parent;
        }
        return false;
    }

    getKey(): NodeKey {
        // Key is stable between copies
        return this.__key;
    }


    //region View

    createDOM(_config: TabManagerConfig, _tabManager: TabManager): HTMLElement {
        invariant(false, 'createDOM: base method not extended');
    }

    updateDOM(
      _prevNode: unknown,
      _dom: HTMLElement,
      _config: TabManagerConfig,
    ): boolean {
        invariant(false, 'updateDOM: base method not extended');
    }

    updateDOMProperties(
      _prevNode: unknown,
      _dom: HTMLElement,
      _config: TabManagerConfig,
    ) {
        //
    }

    exportJSON(): SerializedTabManagerNode {
        invariant(false, 'exportJSON: base method not extended');
    }

    static importJSON(_serializedNode: SerializedTabManagerNode): TabManagerNode {
        invariant(
            false,
            'TabManagerNode: Node %s does not implement .importJSON().',
            this.name,
        );
    }

    //endregion

    remove(preserveEmptyParent?: boolean): void {
        removeNode(this, true, preserveEmptyParent);
    }

    getLatest(): this {
        const latest = $getNodeByKey<this>(this.__key);
        if (latest === null) {
            invariant(
                false,
                'TabManager node does not exist in active editor state. Avoid using the same node references between nested closures from editor.read/editor.update.',
            );
        }
        return latest;
    }

    getParent<T extends ElementNode>(): T | null {
        const parent = this.getLatest().__parent;
        if (parent === null) {
            return null;
        }
        return $getNodeByKey<T>(parent);
    }

    getPreviousSibling<T extends TabManagerNode>(): T | null {
        const parent = this.getParent();
        if (parent === null) {
            return null;
        }
        const children = parent.__children;
        const index = children.indexOf(this.__key);
        if (index <= 0) {
            return null;
        }
        return $getNodeByKey<T>(children[index - 1]);
    }

    getPreviousSiblings<T extends TabManagerNode>(): Array<T> {
        const parent = this.getParent();
        if (parent === null) {
            return [];
        }
        const children = parent.__children;
        const index = children.indexOf(this.__key);
        return children
            .slice(0, index)
            .map((childKey) => $getNodeByKeyOrThrow<T>(childKey));
    }

    getNextSibling<T extends TabManagerNode>(): T | null {
        const parent = this.getParent();
        if (parent === null) {
            return null;
        }
        const children = parent.__children;
        const childrenLength = children.length;
        const index = children.indexOf(this.__key);
        if (index >= childrenLength - 1) {
            return null;
        }
        return $getNodeByKey<T>(children[index + 1]);
    }

    getNextSiblings<T extends TabManagerNode>(): Array<T> {
        const parent = this.getParent();
        if (parent === null) {
            return [];
        }
        const children = parent.__children;
        const index = children.indexOf(this.__key);
        return children
            .slice(index + 1)
            .map((childKey) => $getNodeByKeyOrThrow<T>(childKey));
    }

    getWritable(): this {
        const editorState = getActiveTabManagerState();
        const editor = getActiveTabManager();
        const nodeMap = editorState._nodeMap;
        const key = this.__key;
        // Ensure we get the latest node from pending state
        const latestNode = this.getLatest();
        const parent = latestNode.__parent;
        const cloneNotNeeded = editor._cloneNotNeeded;
        if (cloneNotNeeded.has(key)) {
            // Transforms clear the dirty node set on each iteration to keep track on newly dirty nodes
            internalMarkNodeAsDirty(latestNode);
            return latestNode;
        }
        const constructor = latestNode.constructor;
        // @ts-expect-error
        const mutableNode = constructor.clone(latestNode);
        mutableNode.__parent = parent;
        if ($isElementNode(latestNode) && $isElementNode(mutableNode)) {
            mutableNode.__children = Array.from(latestNode.__children);
        }
        cloneNotNeeded.add(key);
        mutableNode.__key = key;
        internalMarkNodeAsDirty(mutableNode);
        // Update reference in node map
        nodeMap.set(key, mutableNode);

        return mutableNode;
    }

    getParentOrThrow<T extends ElementNode>(): T {
        const parent = this.getParent<T>();
        if (parent === null) {
            invariant(false, 'Expected node %s to have a parent.', this.__key);
        }
        return parent;
    }

    markDirty(): void {
        this.getWritable();
    }

}

export type NodeMap = Map<NodeKey, TabManagerNode>;

export type NodeKey = string;

export function $getNodeByKeyOrThrow<N extends TabManagerNode>(key: NodeKey): N {
    const node = $getNodeByKey<N>(key);
    if (node === null) {
        invariant(
            false,
            "Expected node with key %s to exist but it's not in the nodeMap.",
            key,
        );
    }
    return node;
}

export function removeNode(
    nodeToRemove: TabManagerNode,
    restoreSelection: boolean,
    preserveEmptyParent?: boolean,
): void {
    const key = nodeToRemove.__key;
    const parent = nodeToRemove.getParent();
    if (parent === null) {
        return;
    }

    const writableParent = parent.getWritable();
    const parentChildren = writableParent.__children;
    const index = parentChildren.indexOf(key);
    if (index === -1) {
        invariant(false, 'Node is not a child of its parent');
    }
    internalMarkSiblingsAsDirty(nodeToRemove);
    parentChildren.splice(index, 1);
    const writableNodeToRemove = nodeToRemove.getWritable();
    writableNodeToRemove.__parent = null;
    if (
        !preserveEmptyParent &&
        parent !== null &&
        !$isRootNode(parent) &&
        !parent.canBeEmpty() &&
        parent.isEmpty()
    ) {
        removeNode(parent, restoreSelection);
    }
}

export type SerializedTabManagerNode = {
    type: string;
    version: number;
};
