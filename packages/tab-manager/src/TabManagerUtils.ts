import {NodeKey, NodeMap, TabManagerNode} from "./TabManagerNode";
import {
    CommandPayloadType,
    IntentionallyMarkedAsDirtyElement, Klass, RegisteredTabNode,
    TabManager,
    TabManagerCommand,
    TabManagerThemeClasses
} from "./TabManager";
import {WindowNode} from "./nodes/WindowNode";
import {TabManagerState} from "./TabManagerState";
import {
    errorOnInfiniteTransforms,
    getActiveTabManager,
    getActiveTabManagerState,
    triggerCommandListeners
} from "./TabManagerUpdates";
import {HAS_DIRTY_NODES} from "./TabManagerConstants";
import invariant from "shared/invariant";
import {RootNode} from "./nodes/RootNode";
import {$isElementNode} from "./nodes/ElementNode";
import { $isViewportNode, ViewportNode } from "./nodes/ViewportNode";
import { IS_APPLE } from "shared/environment";

let keyCounter = 1;

export function resetRandomKey(): void {
    keyCounter = 1;
}

export function generateRandomKey(): string {
    return '' + keyCounter++;
}

export function getTabManagersToPropagate(
    tabManager: TabManager,
): Array<TabManager> {
    const tabManagersToPropagate = [];
    let currentTabManager: TabManager | null = tabManager;
    tabManagersToPropagate.push(currentTabManager);
    return tabManagersToPropagate;
}

export function $setNodeKey(
    node: TabManagerNode,
    existingKey: NodeKey | null | undefined,
): void {
    if (existingKey != null) {
        node.__key = existingKey;
        return;
    }
    const tabManager = getActiveTabManager();
    const tabManagerState = getActiveTabManagerState();
    const key = generateRandomKey();
    tabManagerState._nodeMap.set(key, node);

    if ($isElementNode(node)) {
        tabManager._dirtyElements.set(key, true);
    } else {
        tabManager._dirtyLeaves.add(key);
    }
    tabManager._cloneNotNeeded.add(key);
    tabManager._dirtyType = HAS_DIRTY_NODES;
    node.__key = key;
}

export function dispatchCommand<
    TCommand extends TabManagerCommand<unknown>,
    TPayload extends CommandPayloadType<TCommand>,
    >(tabManager: TabManager, type: TCommand, payload: TPayload): boolean {
    return triggerCommandListeners(tabManager, type, payload);
}


export function $getRoot(): RootNode {
    return internalGetRoot(getActiveTabManagerState())
}

export function internalGetRoot(tabManagerState: TabManagerState): RootNode {
    return tabManagerState._nodeMap.get('root') as RootNode;
}

function internalMarkParentElementsAsDirty(
    parentKey: NodeKey,
    nodeMap: NodeMap,
    dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>,
): void {
    let nextParentKey: string | null = parentKey;
    while (nextParentKey !== null) {
        if (dirtyElements.has(nextParentKey)) {
            return;
        }
        const node = nodeMap.get(nextParentKey);
        if (node === undefined) {
            break;
        }
        dirtyElements.set(nextParentKey, false);
        nextParentKey = node.__parent;
    }
}

// Never use this function directly! It will break
// the cloning heuristic. Instead use node.getWritable().
export function internalMarkNodeAsDirty(node: TabManagerNode): void {
    errorOnInfiniteTransforms();
    const latest = node.getLatest();
    const parent = latest.__parent;
    const editorState = getActiveTabManagerState();
    const editor = getActiveTabManager();
    const nodeMap = editorState._nodeMap;
    const dirtyElements = editor._dirtyElements;
    if (parent !== null) {
        internalMarkParentElementsAsDirty(parent, nodeMap, dirtyElements);
    }
    const key = latest.__key;
    editor._dirtyType = HAS_DIRTY_NODES;
    if ($isElementNode(node)) {
        dirtyElements.set(key, true);
    } else {
        // TODO split internally MarkNodeAsDirty into two dedicated Element/leave functions
        editor._dirtyLeaves.add(key);
    }
}

export function removeFromParent(writableNode: TabManagerNode): void {
    const oldParent = writableNode.getParent();
    if (oldParent !== null) {
        const writableParent = oldParent.getWritable();
        const children = writableParent.__children;
        const index = children.indexOf(writableNode.__key);
        if (index === -1) {
            invariant(false, 'Node is not a child of its parent');
        }
        internalMarkSiblingsAsDirty(writableNode);
        children.splice(index, 1);
    }
}

export function internalMarkSiblingsAsDirty(node: TabManagerNode) {
    const previousNode = node.getPreviousSibling();
    const nextNode = node.getNextSibling();
    if (previousNode !== null) {
        internalMarkNodeAsDirty(previousNode);
    }
    if (nextNode !== null) {
        internalMarkNodeAsDirty(nextNode);
    }
}

export function $getNodeByKey<T extends TabManagerNode>(
    key: NodeKey,
    _tabManagerState?: TabManagerState,
): T | null {
    const tabManagerState = _tabManagerState || getActiveTabManagerState();
    const node = tabManagerState._nodeMap.get(key) as T;
    if (node === undefined) {
        return null;
    }
    return node;
}

export const $getViewportNode = (): ViewportNode | undefined => {
    return Array.from(getActiveTabManager().getTabManagerState()._nodeMap.values()).filter((n) => $isViewportNode(n))[0] as ViewportNode | undefined
}

export const getCenter = (x: number, y: number, width: number, height: number) => {
    return {
        x: x + width / 2,
        y: y + height / 2,
    }
}

export function $getPointInWhiteboardFromEventPoint(x: number, y: number): {
    x: number, y: number
} | undefined {
    const tabManager = getActiveTabManager()
    const root = tabManager.getRootElement()
    if (!root) {
        return
    }
    const viewportNode = $getViewportNode()
    if (!viewportNode) {
        return
    }
    const rect = root.getBoundingClientRect()
    // 视觉上的距离
    const deltaX = x - rect.x
    const deltaY = y - rect.y
    return {
        // 减去offset代表的是图上的距离
        x: (deltaX - viewportNode._offsetX) / viewportNode.getLatest()._zoom,
        y: (deltaY - viewportNode._offsetY) / viewportNode.getLatest()._zoom
    }
}

export function getNodeFromDOMNode(
    dom: Node,
    tabManagerState?: TabManagerState,
): TabManagerNode | null {
    const tabManager = getActiveTabManager();
    // @ts-ignore We intentionally add this to the Node.
    const key = dom[`__tabManagerKey_${tabManager._key}`];
    if (key !== undefined) {
        return $getNodeByKey(key, tabManagerState);
    }
    return null;
}

export function getCachedClassNameArray(
    classNamesTheme: TabManagerThemeClasses,
    classNameThemeType: string,
): Array<string> {
    const classNames = classNamesTheme[classNameThemeType];
    // As we're using classList, we need
    // to handle className tokens that have spaces.
    // The easiest way to do this to convert the
    // className tokens to an array that can be
    // applied to classList.add()/remove().
    if (typeof classNames === 'string') {
        const classNamesArr = classNames.split(' ');
        classNamesTheme[classNameThemeType] = classNamesArr;
        return classNamesArr;
    }
    return classNames;
}

export function createUID(): string {
    return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 5);
}

export function $getNearestNodeFromDOMNode(
    startingDOM: Node,
    tabManagerState?: TabManagerState,
): TabManagerNode | null {
    let dom: Node | null = startingDOM;
    while (dom != null) {
        const node = getNodeFromDOMNode(dom, tabManagerState);
        if (node !== null) {
            return node;
        }
        dom = dom.parentNode;
    }
    return null;
}

export function $getNearestNodeTypeFromDOMNode(
    startingDOM: Node,
    nodeKlass?: Klass<TabManagerNode>,
    tabManagerState?: TabManagerState
): TabManagerNode | null {
    let dom: Node | null = startingDOM;
    const tabManager = getActiveTabManager()
    while (dom != null) {
        const node = getNodeFromDOMNode(dom, tabManagerState);
        if (node === null) {
            dom = dom.parentNode;
        }else{
            const klass = tabManager._nodes.get(node.getType())?.klass
            if(nodeKlass){
                if(klass === nodeKlass){
                    return node
                }else{
                    dom = dom.parentNode;
                }
            }
        }
    }
    return null;
}

export function cloneDecorators(
    tabManager: TabManager,
): Record<NodeKey, unknown> {
    const currentDecorators = tabManager._decorators;
    const pendingDecorators = Object.assign({}, currentDecorators);
    tabManager._pendingDecorators = pendingDecorators;
    return pendingDecorators;
}


/**
 * 当执行func之后，timeout时间内再触发的话，会不执行，同时时间从零开始计算，直到timeout时间结束
 * func才会触发
 * @param func
 * @param timeout
 * @param onCancel
 */
// @ts-ignore
export function debounceLeading(func, timeout = 200, onCancel = undefined){
    let timer: NodeJS.Timeout | undefined;
    let isDidRun = false;
    // @ts-ignore
    return (...args) => {
        if (!isDidRun) {
            // @ts-ignore
            func.apply(this, args);
            isDidRun = true
        }else{
            if(onCancel){
                // @ts-ignore
                onCancel.apply(this, args)
            }
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
            isDidRun = false;
        }, timeout);

    };
}

/**
 * 当执行func之后，timeout时间内再触发的话，会不执行，直到timeout时间结束
 * func才会触发
 * @param func
 * @param timeout
 * @param onCancel
 */
// @ts-ignore
export function debounceEach(func, timeout = 200, onCancel = undefined){
    let timer: NodeJS.Timeout | undefined;
    let isDidRun = false;
    // @ts-ignore
    return (...args) => {
        if (!isDidRun) {
            // @ts-ignore
            func.apply(this, args);
            isDidRun = true
            clearTimeout(timer);
            timer = setTimeout(() => {
                isDidRun = false;
            }, timeout);
        }else{
            if(onCancel){
                // @ts-ignore
                onCancel.apply(this, args)
            }
        }
    };
}

// @ts-ignore
export const debounceExecLast = (func, timeout = 200) => {
    let timer: NodeJS.Timeout | undefined;
    // @ts-ignore
    return (...args) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
            timer = undefined
        }, timeout);
    };
}

export function controlOrMeta(metaKey: boolean, ctrlKey: boolean): boolean {
    if (IS_APPLE) {
        return metaKey;
    }
    return ctrlKey;
}

export function isUndo(
  keyCode: number,
  shiftKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean {
    return keyCode === 90 && !shiftKey && controlOrMeta(metaKey, ctrlKey);
}

export function isRedo(
  keyCode: number,
  shiftKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean {
    if (IS_APPLE) {
        return keyCode === 90 && metaKey && shiftKey;
    }
    return (keyCode === 89 && ctrlKey) || (keyCode === 90 && ctrlKey && shiftKey);
}
