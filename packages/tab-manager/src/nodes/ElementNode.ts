import type {
    NodeKey,
    SerializedTabManagerNode
} from "../TabManagerNode";

import {$getNodeByKey, internalMarkNodeAsDirty, removeFromParent} from "../TabManagerUtils";
import invariant from "shared/invariant";
import {Spread, TabManagerConfig} from "../TabManager";
import {$isRootNode} from "../";
import {TabManagerNode} from "../TabManagerNode";


export type SerializedElementNode = Spread<{
    children: Array<SerializedTabManagerNode>;
    active: boolean,
},
    SerializedTabManagerNode>;

export class ElementNode extends TabManagerNode {
    __children: Array<NodeKey>;
    protected __active: boolean;

    constructor(key?: NodeKey) {
        super(key);
        this.__children = [];
        this.__active = false
    }

    getActive(): boolean {
        const self = this.getLatest();
        return self.__active;
    }

    getChildren<T extends TabManagerNode>(): Array<T> {
        const self = this.getLatest();
        const children = self.__children;
        const childrenNodes: Array<T> = [];
        for (let i = 0; i < children.length; i++) {
            const childNode = $getNodeByKey<T>(children[i]);
            if (childNode !== null) {
                childrenNodes.push(childNode);
            }
        }
        return childrenNodes;
    }

    getChildrenKeys(): Array<NodeKey> {
        return this.getLatest().__children;
    }

    getChildrenSize(): number {
        const self = this.getLatest();
        return self.__children.length;
    }

    isEmpty(): boolean {
        return this.getChildrenSize() === 0;
    }

    isLastChild(): boolean {
        const self = this.getLatest();
        const parent = self.getParentOrThrow();
        return parent.getLastChild() === self;
    }

    getFirstDescendant<T extends TabManagerNode>(): null | T {
        let node = this.getFirstChild<T>();
        while (node !== null) {
            if ($isElementNode(node)) {
                const child = node.getFirstChild<T>();
                if (child !== null) {
                    node = child;
                    continue;
                }
            }
            break;
        }
        return node;
    }

    getLastDescendant<T extends TabManagerNode>(): null | T {
        let node = this.getLastChild<T>();
        while (node !== null) {
            if ($isElementNode(node)) {
                const child = node.getLastChild<T>();
                if (child !== null) {
                    node = child;
                    continue;
                }
            }
            break;
        }
        return node;
    }

    getDescendantByIndex<T extends TabManagerNode>(index: number): null | T {
        const children = this.getChildren<T>();
        const childrenLength = children.length;
        // For non-empty element nodes, we resolve its descendant
        // (either a leaf node or the bottom-most element)
        if (index >= childrenLength) {
            const resolvedNode = children[childrenLength - 1];
            return (
                ($isElementNode(resolvedNode) && resolvedNode.getLastDescendant()) ||
                resolvedNode ||
                null
            );
        }
        const resolvedNode = children[index];
        return (
            ($isElementNode(resolvedNode) && resolvedNode.getFirstDescendant()) ||
            resolvedNode ||
            null
        );
    }

    getFirstChild<T extends TabManagerNode>(): null | T {
        const self = this.getLatest();
        const children = self.__children;
        const childrenLength = children.length;
        if (childrenLength === 0) {
            return null;
        }
        return $getNodeByKey<T>(children[0]);
    }

    getFirstChildOrThrow<T extends TabManagerNode>(): T {
        const firstChild = this.getFirstChild<T>();
        if (firstChild === null) {
            invariant(false, 'Expected node %s to have a first child.', this.__key);
        }
        return firstChild;
    }

    getLastChild<T extends TabManagerNode>(): null | T {
        const self = this.getLatest();
        const children = self.__children;
        const childrenLength = children.length;
        if (childrenLength === 0) {
            return null;
        }
        return $getNodeByKey<T>(children[childrenLength - 1]);
    }

    getChildAtIndex<T extends TabManagerNode>(index: number): null | T {
        const self = this.getLatest();
        const children = self.__children;
        const key = children[index];
        if (key === undefined) {
            return null;
        }
        return $getNodeByKey(key);
    }
    canBeEmpty(): boolean {
        return true;
    }

    //region mutators

    append(...nodesToAppend: TabManagerNode[]): this {
        return this.splice(this.getChildrenSize(), 0, nodesToAppend);
    }

    insertAtFirst(...nodesToAppend: TabManagerNode[]): this {
        return this.splice(0, 0, nodesToAppend);
    }

    splice(
        start: number,
        deleteCount: number,
        nodesToInsert: Array<TabManagerNode>,
    ): this {
        const writableSelf = this.getWritable();
        const writableSelfKey = writableSelf.__key;
        const writableSelfChildren = writableSelf.__children;
        const nodesToInsertLength = nodesToInsert.length;
        const nodesToInsertKeys = [];

        // Remove nodes to insert from their previous parent
        for (let i = 0; i < nodesToInsertLength; i++) {
            const nodeToInsert = nodesToInsert[i];
            const writableNodeToInsert = nodeToInsert.getWritable();
            if (nodeToInsert.__key === writableSelfKey) {
                invariant(false, 'append: attempting to append self');
            }
            removeFromParent(writableNodeToInsert);
            // Set child parent to self
            writableNodeToInsert.__parent = writableSelfKey;
            const newKey = writableNodeToInsert.__key;
            nodesToInsertKeys.push(newKey);
        }

        // Mark range edges siblings as dirty
        const nodeBeforeRange = this.getChildAtIndex(start - 1);
        if (nodeBeforeRange) {
            internalMarkNodeAsDirty(nodeBeforeRange);
        }
        const nodeAfterRange = this.getChildAtIndex(start + deleteCount);
        if (nodeAfterRange) {
            internalMarkNodeAsDirty(nodeAfterRange);
        }

        // Remove defined range of children
        let nodesToRemoveKeys: Array<NodeKey>;

        // Using faster push when only appending nodes
        if (start === writableSelfChildren.length) {
            writableSelfChildren.push(...nodesToInsertKeys);
            nodesToRemoveKeys = [];
        } else {
            nodesToRemoveKeys = writableSelfChildren.splice(
                start,
                deleteCount,
                ...nodesToInsertKeys,
            );
        }

        // In case of deletion we need to adjust selection, unlink removed nodes
        // and clean up node itself if it becomes empty. None of these needed
        // for insertion-only cases
        if (nodesToRemoveKeys.length) {
            // Adjusting selection, in case node that was anchor/focus will be deleted
            // const nodesToRemoveKeySet = new Set(nodesToRemoveKeys);
            // const nodesToInsertKeySet = new Set(nodesToInsertKeys);
            // const isPointRemoved = (point: PointType): boolean => {
            //     let node: ElementNode | TextNode | null = point.getNode();
            //     while (node) {
            //         const nodeKey = node.__key;
            //         if (
            //             nodesToRemoveKeySet.has(nodeKey) &&
            //             !nodesToInsertKeySet.has(nodeKey)
            //         ) {
            //             return true;
            //         }
            //         node = node.getParent();
            //     }
            //     return false;
            // };

            // const {anchor, focus} = selection;
            // if (isPointRemoved(anchor)) {
            //     moveSelectionPointToSibling(
            //         anchor,
            //         anchor.getNode(),
            //         this,
            //         nodeBeforeRange,
            //         nodeAfterRange,
            //     );
            // }
            // if (isPointRemoved(focus)) {
            //     moveSelectionPointToSibling(
            //         focus,
            //         focus.getNode(),
            //         this,
            //         nodeBeforeRange,
            //         nodeAfterRange,
            //     );
            // }

            // Unlink removed nodes from current parent
            const nodesToRemoveKeysLength = nodesToRemoveKeys.length;
            for (let i = 0; i < nodesToRemoveKeysLength; i++) {
                const nodeToRemove = $getNodeByKey<TabManagerNode>(nodesToRemoveKeys[i]);
                if (nodeToRemove != null) {
                    const writableNodeToRemove = nodeToRemove.getWritable();
                    writableNodeToRemove.__parent = null;
                }
            }

            // Cleanup if node can't be empty

            if (
                writableSelfChildren.length === 0 &&
                !this.canBeEmpty() &&
                !$isRootNode(this)
            ) {
                this.remove();
            }
        }

        return writableSelf;
    }


    setActive(active: boolean) {
        const self = this.getWritable();
        self.__active = active;
    }

    updateDOM(_prevNode: ElementNode, _dom: HTMLElement, _config: TabManagerConfig): boolean {
        /**
         * 如果为true，会导致TabGroupNode在激活时调用updateDOM
         * 会导致TabGroupNode里面聚焦进行blur且selectionchange事件捕捉不到
         * 而且在beginUpdate之后也拿不到最新的selection
         * 所以这里的机制是改为只有TabNode去根据active来更新dom
         */
        return false;
    }

//endregion

    //region serialization
    exportJSON(): SerializedElementNode {
        return {
            children: [],
            active: this.getActive(),
            type: 'element',
            version: 1,
        };
    }

    //endregion
}

export function $isElementNode(
    node: TabManagerNode | null | undefined,
): node is ElementNode {
    return node instanceof ElementNode;
}

