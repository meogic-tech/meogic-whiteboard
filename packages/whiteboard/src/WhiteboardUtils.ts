import {NodeKey, NodeMap, WhiteboardNode} from "./WhiteboardNode";
import {
    CommandPayloadType,
    IntentionallyMarkedAsDirtyElement, Klass,
    Whiteboard,
    WhiteboardCommand,
    WhiteboardThemeClasses
} from "./Whiteboard";
import {WhiteboardState} from "./WhiteboardState";
import {
    errorOnInfiniteTransforms,
    getActiveWhiteboard,
    getActiveWhiteboardState,
    triggerCommandListeners
} from "./WhiteboardUpdates";
import {HAS_DIRTY_NODES} from "./WhiteboardConstants";
import invariant from "shared/invariant";
import {RootNode} from "./nodes/RootNode";
import {$isElementNode} from "./nodes/ElementNode";
import { $isViewportNode, ViewportNode } from "./nodes/ViewportNode";
import { IS_APPLE } from "shared/environment";
import { $isAuxiliaryLineContainerNode } from "./nodes";

let keyCounter = 1;

export function resetRandomKey(): void {
    keyCounter = 1;
}

export function generateRandomKey(): string {
    return '' + keyCounter++;
}

export function getWhiteboardsToPropagate(
    whiteboard: Whiteboard,
): Array<Whiteboard> {
    const whiteboardsToPropagate = [];
    let currentWhiteboard: Whiteboard | null = whiteboard;
    whiteboardsToPropagate.push(currentWhiteboard);
    return whiteboardsToPropagate;
}

export function $setNodeKey(
    node: WhiteboardNode,
    existingKey: NodeKey | null | undefined,
): void {
    if (existingKey != null) {
        node.__key = existingKey;
        return;
    }
    const whiteboard = getActiveWhiteboard();
    const whiteboardState = getActiveWhiteboardState();
    const key = generateRandomKey();
    whiteboardState._nodeMap.set(key, node);

    if ($isElementNode(node)) {
        whiteboard._dirtyElements.set(key, true);
    } else {
        whiteboard._dirtyLeaves.add(key);
    }
    whiteboard._cloneNotNeeded.add(key);
    whiteboard._dirtyType = HAS_DIRTY_NODES;
    node.__key = key;
}

export function dispatchCommand<
    TCommand extends WhiteboardCommand<unknown>,
    TPayload extends CommandPayloadType<TCommand>,
    >(whiteboard: Whiteboard, type: TCommand, payload: TPayload): boolean {
    return triggerCommandListeners(whiteboard, type, payload);
}


export function $getRoot(): RootNode {
    return internalGetRoot(getActiveWhiteboardState())
}

export function internalGetRoot(whiteboardState: WhiteboardState): RootNode {
    return whiteboardState._nodeMap.get('root') as RootNode;
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
export function internalMarkNodeAsDirty(node: WhiteboardNode): void {
    errorOnInfiniteTransforms();
    const latest = node.getLatest();
    const parent = latest.__parent;
    const editorState = getActiveWhiteboardState();
    const editor = getActiveWhiteboard();
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

export function removeFromParent(writableNode: WhiteboardNode): void {
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

export function internalMarkSiblingsAsDirty(node: WhiteboardNode) {
    const previousNode = node.getPreviousSibling();
    const nextNode = node.getNextSibling();
    if (previousNode !== null) {
        internalMarkNodeAsDirty(previousNode);
    }
    if (nextNode !== null) {
        internalMarkNodeAsDirty(nextNode);
    }
}

export function $getNodeByKey<T extends WhiteboardNode>(
    key: NodeKey,
    _whiteboardState?: WhiteboardState,
): T | null {
    const whiteboardState = _whiteboardState || getActiveWhiteboardState();
    const node = whiteboardState._nodeMap.get(key) as T;
    if (node === undefined) {
        return null;
    }
    return node;
}

export const $getViewportNode = (): ViewportNode | undefined => {
    return Array.from(getActiveWhiteboardState()._nodeMap.values()).filter((n) => $isViewportNode(n))[0] as ViewportNode | undefined
}

export const $getAuxiliaryLineContainerNode = (): ViewportNode | undefined => {
    return Array.from(getActiveWhiteboardState()._nodeMap.values()).filter((n) => $isAuxiliaryLineContainerNode(n))[0] as ViewportNode | undefined
}

export const getCenter = (x: number, y: number, width: number, height: number) => {
    return {
        x: x + width / 2,
        y: y + height / 2,
    }
}

export function $getEventPointFromWhiteboardPoint(x: number, y: number): {
    x: number, y: number
} | undefined {
    const whiteboard = getActiveWhiteboard()
    const root = whiteboard.getRootElement()
    if (!root) {
        return
    }
    const viewportNode = $getViewportNode()
    if (!viewportNode) {
        return
    }
    /**
     * width: 1800px
     */
    const rect = root.getBoundingClientRect()
    const offsetX = viewportNode.getOffsetX()
    const offsetY = viewportNode.getOffsetY()

    return {
        x: (x + offsetX / viewportNode.getZoom() - rect.width / 2) * viewportNode.getZoom() + (rect.width / 2),
        y: (y + offsetY / viewportNode.getZoom() - rect.height / 2) * viewportNode.getZoom() + (rect.height / 2),
    }
}

/**
 * 以前的算法
 * @param x
 * @param y
 */

/*export function $getPointInWhiteboardFromEventPoint(x: number, y: number): {
    x: number, y: number
} | undefined {
    const whiteboard = getActiveWhiteboard()
    const root = whiteboard.getRootElement()
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
    // console.table({deltaY, 'viewportNode.getOffsetY()': viewportNode.getOffsetY(), 'viewportNode.getLatest()._zoom': viewportNode.getLatest()._zoom});
    return {
        // 减去offset代表的是图上的距离
        x: (deltaX - viewportNode.getOffsetX()) / viewportNode.getLatest()._zoom,
        y: (deltaY - viewportNode.getOffsetY()) / viewportNode.getLatest()._zoom
    }
}*/

export function $getPointInWhiteboardFromEventPoint(x: number, y: number): {
    x: number, y: number
} | undefined {
    const whiteboard = getActiveWhiteboard()
    const root = whiteboard.getRootElement()
    if (!root) {
        return
    }
    const viewportNode = $getViewportNode()
    if (!viewportNode) {
        return
    }
    /**
     * width: 1800px
     */
    const rect = root.getBoundingClientRect()
    // 距离中心点的距离
    /**
     * deltaX: 0
     */
    const deltaX = x - (rect.x + rect.width / 2)
    const deltaY = y - (rect.y + rect.height / 2)

    const offsetX = viewportNode.getOffsetX()
    const offsetY = viewportNode.getOffsetY()

    // 900 - 0 - 0
    const pointX = rect.width / 2 - offsetX / viewportNode.getZoom() + deltaX / viewportNode.getZoom()
    // 900 - 0 - 0
    const pointY = rect.height / 2 - offsetY / viewportNode.getZoom() + deltaY / viewportNode.getZoom()
    /*console.table({deltaY,
        'x': pointX,
        'y': pointY,
    });*/
    return {
        // 减去offset代表的是图上的距离
        x: pointX,
        y: pointY
    }
}

export function getNodeFromDOMNode(
    dom: Node,
    whiteboardState?: WhiteboardState,
): WhiteboardNode | null {
    const whiteboard = getActiveWhiteboard();
    // @ts-ignore We intentionally add this to the Node.
    const key = dom[`__whiteboardKey_${whiteboard._key}`];
    if (key !== undefined) {
        return $getNodeByKey(key, whiteboardState);
    }
    return null;
}

export function getCachedClassNameArray(
    classNamesTheme: WhiteboardThemeClasses,
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
    whiteboardState?: WhiteboardState,
): WhiteboardNode | null {
    let dom: Node | null = startingDOM;
    while (dom != null) {
        const node = getNodeFromDOMNode(dom, whiteboardState);
        if (node !== null) {
            return node;
        }
        dom = dom.parentNode;
    }
    return null;
}

export function $getNearestNodeTypeFromDOMNode(
    startingDOM: Node,
    nodeKlass?: Klass<WhiteboardNode>,
    whiteboardState?: WhiteboardState
): WhiteboardNode | null {
    let dom: Node | null = startingDOM;
    const whiteboard = getActiveWhiteboard()
    while (dom != null) {
        const node = getNodeFromDOMNode(dom, whiteboardState);
        if (node === null) {
            dom = dom.parentNode;
        }else{
            const klass = whiteboard._nodes.get(node.getType())?.klass
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

export function $getNearestNodeInheritTypeFromDOMNode(
  startingDOM: Node,
  nodeKlass?: Klass<WhiteboardNode>,
  whiteboardState?: WhiteboardState
): WhiteboardNode | null {
    let dom: Node | null = startingDOM;
    while (dom != null) {
        const node = getNodeFromDOMNode(dom, whiteboardState);
        if (node === null) {
            dom = dom.parentNode;
        }else{
            // @ts-ignore
            if(node instanceof nodeKlass){
                return node
            }else{
                dom = dom.parentNode;
            }
        }
    }
    return null;
}

export function cloneDecorators(
    whiteboard: Whiteboard,
): Record<NodeKey, unknown> {
    const currentDecorators = whiteboard._decorators;
    const pendingDecorators = Object.assign({}, currentDecorators);
    whiteboard._pendingDecorators = pendingDecorators;
    return pendingDecorators;
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

export function isDeleteBackward(
  keyCode: number,
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
): boolean {
    if (IS_APPLE) {
        if (altKey || metaKey) {
            return false;
        }
        return isBackspace(keyCode) || (keyCode === 72 && ctrlKey);
    }
    if (ctrlKey || altKey || metaKey) {
        return false;
    }
    return isBackspace(keyCode);
}

export function isDeleteForward(
  keyCode: number,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
): boolean {
    if (IS_APPLE) {
        if (shiftKey || altKey || metaKey) {
            return false;
        }
        return isDelete(keyCode) || (keyCode === 68 && ctrlKey);
    }
    if (ctrlKey || altKey || metaKey) {
        return false;
    }
    return isDelete(keyCode);
}

export function isBackspace(keyCode: number): boolean {
    return keyCode === 8;
}

export function isDelete(keyCode: number): boolean {
    return keyCode === 46;
}
