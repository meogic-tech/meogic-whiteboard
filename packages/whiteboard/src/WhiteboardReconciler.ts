import {WhiteboardState} from "./WhiteboardState";
import {
    IntentionallyMarkedAsDirtyElement,
    MutatedNodes, MutationListeners, NodeMutation,
    RegisteredNodes,
    Whiteboard,
    WhiteboardConfig
} from "./Whiteboard";
import {NodeKey, NodeMap, WhiteboardNode} from "./WhiteboardNode";
import {FULL_RECONCILE} from "./WhiteboardConstants";
import invariant from "shared/invariant";
import {$isElementNode, ElementNode} from "./nodes/ElementNode";
import { $isDecoratorNode, DecoratorNode } from "./nodes/DecoratorNode";

let subTreeTextContent = '';
let subTreeDirectionedTextContent = '';
let whiteboardTextContent = '';
let activeWhiteboardConfig: WhiteboardConfig;
let activeWhiteboard: Whiteboard;
let activeWhiteboardNodes: RegisteredNodes;
let treatAllNodesAsDirty = false;
let activeWhiteboardStateReadOnly = false;
let activeMutationListeners: MutationListeners;
let activeInheritableMutationListeners: MutationListeners;
let activeTextDirection: 'ltr' | 'rtl' | null = null;
let activeDirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>;
let activeDirtyLeaves: Set<NodeKey>;
let activePrevNodeMap: NodeMap;
let activeNextNodeMap: NodeMap;
let activePrevKeyToDOMMap: Map<NodeKey, HTMLElement>;
let mutatedNodes: MutatedNodes;

export function storeDOMWithKey(
    key: NodeKey,
    dom: HTMLElement,
    whiteboard: Whiteboard,
): void {
    const keyToDOMMap = whiteboard._keyToDOMMap;
    // @ts-ignore We intentionally add this to the Node.
    dom['__whiteboardKey_' + whiteboard._key] = key;
    keyToDOMMap.set(key, dom);
}

function createChildren(
    children: Array<NodeKey>,
    _startIndex: number,
    endIndex: number,
    dom: null | HTMLElement,
    insertDOM: null | HTMLElement,
): void {
    const previousSubTreeTextContent = subTreeTextContent;
    subTreeTextContent = '';
    let startIndex = _startIndex;

    for (; startIndex <= endIndex; ++startIndex) {
        createNode(children[startIndex], dom, insertDOM);
    }

    // @ts-expect-error: internal field
    dom.__whiteboardTextContent = subTreeTextContent;
    subTreeTextContent = previousSubTreeTextContent + subTreeTextContent;
}

function createChildrenWithDirection(
    children: Array<NodeKey>,
    endIndex: number,
    element: ElementNode,
    dom: HTMLElement,
): void {
    const previousSubTreeDirectionedTextContent = subTreeDirectionedTextContent;
    subTreeDirectionedTextContent = '';
    createChildren(children, 0, endIndex, dom, null);
    subTreeDirectionedTextContent = previousSubTreeDirectionedTextContent;
}

export function cloneDecorators(
    whiteboard: Whiteboard,
): Record<NodeKey, unknown> {
    const currentDecorators = whiteboard._decorators;
    const pendingDecorators = Object.assign({}, currentDecorators);
    whiteboard._pendingDecorators = pendingDecorators;
    return pendingDecorators;
}

function reconcileDecorator(key: NodeKey, decorator: unknown): void {
    let pendingDecorators = activeWhiteboard._pendingDecorators;
    const currentDecorators = activeWhiteboard._decorators;

    if (pendingDecorators === null) {
        if (currentDecorators[key] === decorator) {
            return;
        }

        pendingDecorators = cloneDecorators(activeWhiteboard);
    }

    pendingDecorators[key] = decorator;
}

function createNode(
    key: NodeKey,
    parentDOM: null | HTMLElement,
    insertDOM: null | Node,
): HTMLElement {
    const node = activeNextNodeMap.get(key);

    if (node === undefined) {
        invariant(false, 'createNode: node does not exist in nodeMap');
    }

    const dom = node.createDOM(activeWhiteboardConfig, activeWhiteboard);
    storeDOMWithKey(key, dom, activeWhiteboard);


    if ($isElementNode(node)) {

        const children = node.__children;
        const childrenLength = children.length;

        if (childrenLength !== 0) {
            const endIndex = childrenLength - 1;
            createChildrenWithDirection(children, endIndex, node, dom);
        }

    } else {
        if($isDecoratorNode(node)) {
            const decorator = node.decorate(activeWhiteboard, activeWhiteboardConfig)
            if(decorator !== null){
                reconcileDecorator(key, decorator)
            }
        }
    }

    if (parentDOM !== null) {
        if (insertDOM != null) {
            parentDOM.insertBefore(dom, insertDOM);
        } else {
            parentDOM.appendChild(dom);
        }
    }

    if (__DEV__) {
        // Freeze the node in DEV to prevent accidental mutations
        Object.freeze(node);
    }

    setMutatedNode(
        mutatedNodes,
        activeWhiteboardNodes,
        activeMutationListeners,
        activeInheritableMutationListeners,
        node,
        'created',
    );

    return dom;
}

export function reconcileRoot(
    prevWhiteboardState: WhiteboardState,
    nextWhiteboardState: WhiteboardState,
    whiteboard: Whiteboard,
    dirtyType: 0 | 1 | 2,
    dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>,
    dirtyLeaves: Set<NodeKey>,
): MutatedNodes {
    subTreeTextContent = '';
    whiteboardTextContent = '';
    subTreeDirectionedTextContent = '';
    // Rather than pass around a load of arguments through the stack recursively
    // we instead set them as bindings within the scope of the module.
    treatAllNodesAsDirty = dirtyType === FULL_RECONCILE;
    activeTextDirection = null;
    activeWhiteboard = whiteboard;
    activeWhiteboardConfig = whiteboard._config;
    activeWhiteboardNodes = whiteboard._nodes;
    activeMutationListeners = activeWhiteboard._listeners.mutation;
    activeInheritableMutationListeners = activeWhiteboard._listeners.inheritableMutation;
    activeDirtyElements = dirtyElements;
    activeDirtyLeaves = dirtyLeaves;
    activePrevNodeMap = prevWhiteboardState._nodeMap;
    activeNextNodeMap = nextWhiteboardState._nodeMap;
    activePrevKeyToDOMMap = new Map(whiteboard._keyToDOMMap);
    const currentMutatedNodes = new Map();
    mutatedNodes = currentMutatedNodes;
    reconcileNode('root', null);
    // We don't want a bunch of void checks throughout the scope
    // so instead we make it seem that these values are always set.
    // We also want to make sure we clear them down, otherwise we
    // can leak memory.
    // @ts-ignore
    activeWhiteboard = undefined;
    // @ts-ignore
    activeWhiteboardNodes = undefined;
    // @ts-ignore
    activeDirtyElements = undefined;
    // @ts-ignore
    activeDirtyLeaves = undefined;
    // @ts-ignore
    activePrevNodeMap = undefined;
    // @ts-ignore
    activeNextNodeMap = undefined;
    // @ts-ignore
    activeWhiteboardConfig = undefined;
    // @ts-ignore
    activePrevKeyToDOMMap = undefined;

    return currentMutatedNodes
}


function reconcileChildrenWithDirection(
    prevChildren: Array<NodeKey>,
    nextChildren: Array<NodeKey>,
    element: ElementNode,
    dom: HTMLElement,
): void {
    const previousSubTreeDirectionTextContent = subTreeDirectionedTextContent;
    subTreeDirectionedTextContent = '';
    reconcileChildren(element, prevChildren, nextChildren, dom);
    subTreeDirectionedTextContent = previousSubTreeDirectionTextContent;
}

function destroyNode(key: NodeKey, parentDOM: null | HTMLElement): void {
    const node = activePrevNodeMap.get(key);

    if (parentDOM !== null) {
        const dom = getPrevElementByKeyOrThrow(key);
        parentDOM.removeChild(dom);
    }

    // This logic is really important, otherwise we will leak DOM nodes
    // when their corresponding WhiteboardNodes are removed from the editor state.
    if (!activeNextNodeMap.has(key)) {
        activeWhiteboard._keyToDOMMap.delete(key);
    }

    if ($isElementNode(node)) {
        const children = node.__children;
        destroyChildren(children, 0, children.length - 1, null);
    }

    if (node !== undefined) {
        setMutatedNode(
            mutatedNodes,
            activeWhiteboardNodes,
            activeMutationListeners,
            activeInheritableMutationListeners,
            node,
            'destroyed',
        );
    }
}

function destroyChildren(
    children: Array<NodeKey>,
    _startIndex: number,
    endIndex: number,
    dom: null | HTMLElement,
): void {
    let startIndex = _startIndex;

    for (; startIndex <= endIndex; ++startIndex) {
        const child = children[startIndex];

        if (child !== undefined) {
            destroyNode(child, dom);
        }
    }
}
function getFirstChild(element: HTMLElement): Node | null {
    return element.firstChild;
}

function getNextSibling(element: HTMLElement): Node | null {
    return element.nextSibling;
}

function reconcileNodeChildren(
    prevChildren: Array<NodeKey>,
    nextChildren: Array<NodeKey>,
    prevChildrenLength: number,
    nextChildrenLength: number,
    element: ElementNode,
    dom: HTMLElement,
): void {
    const prevEndIndex = prevChildrenLength - 1;
    const nextEndIndex = nextChildrenLength - 1;
    let prevChildrenSet: Set<NodeKey> | undefined;
    let nextChildrenSet: Set<NodeKey> | undefined;
    let siblingDOM: null | Node = getFirstChild(dom);
    let prevIndex = 0;
    let nextIndex = 0;

    while (prevIndex <= prevEndIndex && nextIndex <= nextEndIndex) {
        const prevKey = prevChildren[prevIndex];
        const nextKey = nextChildren[nextIndex];

        if (prevKey === nextKey) {
            siblingDOM = getNextSibling(reconcileNode(nextKey, dom));
            prevIndex++;
            nextIndex++;
        } else {
            if (prevChildrenSet === undefined) {
                prevChildrenSet = new Set(prevChildren);
            }

            if (nextChildrenSet === undefined) {
                nextChildrenSet = new Set(nextChildren);
            }

            const nextHasPrevKey = nextChildrenSet.has(prevKey);
            const prevHasNextKey = prevChildrenSet.has(nextKey);

            if (!nextHasPrevKey) {
                // Remove prev
                siblingDOM = getNextSibling(getPrevElementByKeyOrThrow(prevKey));
                destroyNode(prevKey, dom);
                prevIndex++;
            } else if (!prevHasNextKey) {
                // Create next
                createNode(nextKey, dom, siblingDOM);
                nextIndex++;
            } else {
                // Move next
                const childDOM = getElementByKeyOrThrow(activeWhiteboard, nextKey);

                if (childDOM === siblingDOM) {
                    siblingDOM = getNextSibling(reconcileNode(nextKey, dom));
                } else {
                    if (siblingDOM != null) {
                        dom.insertBefore(childDOM, siblingDOM);
                    } else {
                        dom.appendChild(childDOM);
                    }

                    reconcileNode(nextKey, dom);
                }

                prevIndex++;
                nextIndex++;
            }
        }
    }

    const appendNewChildren = prevIndex > prevEndIndex;
    const removeOldChildren = nextIndex > nextEndIndex;

    if (appendNewChildren && !removeOldChildren) {
        const previousNode = nextChildren[nextEndIndex + 1];
        const insertDOM =
            previousNode === undefined
                ? null
                : activeWhiteboard.getElementByKey(previousNode);
        createChildren(nextChildren, nextIndex, nextEndIndex, dom, insertDOM);
    } else if (removeOldChildren && !appendNewChildren) {
        destroyChildren(prevChildren, prevIndex, prevEndIndex, dom);
    }
}

function reconcileChildren(
    element: ElementNode,
    prevChildren: Array<NodeKey>,
    nextChildren: Array<NodeKey>,
    dom: HTMLElement,
): void {
    const previousSubTreeTextContent = subTreeTextContent;
    subTreeTextContent = '';
    const prevChildrenLength = prevChildren.length;
    const nextChildrenLength = nextChildren.length;

    if (prevChildrenLength === 1 && nextChildrenLength === 1) {
        const prevChildKey = prevChildren[0];
        const nextChildKey = nextChildren[0];

        if (prevChildKey === nextChildKey) {
            reconcileNode(prevChildKey, dom);
        } else {
            const lastDOM = getPrevElementByKeyOrThrow(prevChildKey);
            const replacementDOM = createNode(nextChildKey, null, null);
            dom.replaceChild(replacementDOM, lastDOM);
            destroyNode(prevChildKey, null);
        }
    } else if (prevChildrenLength === 0) {
        if (nextChildrenLength !== 0) {
            createChildren(nextChildren, 0, nextChildrenLength - 1, dom, null);
        }
    } else if (nextChildrenLength === 0) {
        if (prevChildrenLength !== 0) {
            destroyChildren(
                prevChildren,
                0,
                prevChildrenLength - 1,
                dom,
            );
        }
    } else {
        reconcileNodeChildren(
            prevChildren,
            nextChildren,
            prevChildrenLength,
            nextChildrenLength,
            element,
            dom,
        );
    }

    // @ts-expect-error: internal field
    dom.__whiteboardTextContent = subTreeTextContent;
    subTreeTextContent = previousSubTreeTextContent + subTreeTextContent;
}

function reconcileNode(
    key: NodeKey,
    parentDOM: HTMLElement | null,
): HTMLElement {
    const prevNode = activePrevNodeMap.get(key);
    let nextNode = activeNextNodeMap.get(key);

    if (prevNode === undefined || nextNode === undefined) {
        invariant(
            false,
            'reconcileNode: prevNode or nextNode does not exist in nodeMap',
        );
    }

    const isDirty =
        treatAllNodesAsDirty ||
        activeDirtyLeaves.has(key) ||
        activeDirtyElements.has(key);
    const dom = getElementByKeyOrThrow(activeWhiteboard, key);

    if (prevNode !== nextNode && isDirty) {
        setMutatedNode(
            mutatedNodes,
            activeWhiteboardNodes,
            activeMutationListeners,
            activeInheritableMutationListeners,
            nextNode,
            'updated',
        );
    }

    nextNode.updateDOMProperties(prevNode, dom, activeWhiteboardConfig)
    // Update node. If it returns true, we need to unmount and re-create the node
    if (nextNode.updateDOM(prevNode, dom, activeWhiteboardConfig)) {
        const replacementDOM = createNode(key, null, null);

        if (parentDOM === null) {
            invariant(false, 'reconcileNode: parentDOM is null');
        }

        parentDOM.replaceChild(replacementDOM, dom);
        destroyNode(key, null);
        return replacementDOM;
    }

    if ($isElementNode(prevNode) && $isElementNode(nextNode)) {

        const prevChildren = prevNode.__children;
        const nextChildren = nextNode.__children;
        const childrenAreDifferent = prevChildren !== nextChildren;

        if (childrenAreDifferent || isDirty) {
            reconcileChildrenWithDirection(prevChildren, nextChildren, nextNode, dom);
        }

    } else {
        if ($isDecoratorNode(nextNode)) {
            const decorator = nextNode.decorate(activeWhiteboard, activeWhiteboardConfig);

            if (decorator !== null) {
                reconcileDecorator(key, decorator);
            }
        }
    }


    if (__DEV__) {
        // Freeze the node in DEV to prevent accidental mutations
        Object.freeze(nextNode);
    }

    return dom;
}


export function getElementByKeyOrThrow(
    whiteboard: Whiteboard,
    key: NodeKey,
): HTMLElement {
    const element = whiteboard._keyToDOMMap.get(key);

    if (element === undefined) {
        invariant(
            false,
            'Reconciliation: could not find DOM element for node key %s',
            key,
        );
    }

    return element;
}

function getPrevElementByKeyOrThrow(key: NodeKey): HTMLElement {
    const element = activePrevKeyToDOMMap.get(key);

    if (element === undefined) {
        invariant(
            false,
            'Reconciliation: could not find DOM element for node key %s',
            key,
        );
    }

    return element;
}

export function setMutatedNode(
    mutatedNodes: MutatedNodes,
    registeredNodes: RegisteredNodes,
    mutationListeners: MutationListeners,
    inheritableMutationListeners: MutationListeners,
    node: WhiteboardNode,
    mutation: NodeMutation,
) {
    if (mutationListeners.size === 0 && inheritableMutationListeners.size === 0) {
        return;
    }
    const nodeType = node.__type;
    const nodeKey = node.__key;
    const registeredNode = registeredNodes.get(nodeType);
    if (registeredNode === undefined) {
        invariant(false, 'Type %s not in registeredNodes', nodeType);
    }
    const klass = registeredNode.klass;
    let mutatedNodesByType = mutatedNodes.get(klass);
    if (mutatedNodesByType === undefined) {
        mutatedNodesByType = new Map();
        mutatedNodes.set(klass, mutatedNodesByType);
    }
    if (!mutatedNodesByType.has(nodeKey)) {
        mutatedNodesByType.set(nodeKey, mutation);
    }
}
