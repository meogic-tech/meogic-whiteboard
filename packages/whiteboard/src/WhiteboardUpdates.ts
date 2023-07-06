import {
    cloneWhiteboardState, createEmptyWhiteboardState,
    SerializedWhiteboardState,
    WhiteboardState,
    whiteboardStateHasDirtySelection
} from "./WhiteboardState";
import invariant from "shared/invariant";
import {
    Listener,
    MutatedNodes,
    RegisteredNodes,
    resetWhiteboard,
    Whiteboard,
    WhiteboardCommand,
    WhiteboardUpdateOptions,
} from "./Whiteboard";
import {internalCreateSelection} from "./WhiteboardSelection";
import {FULL_RECONCILE, NO_DIRTY_NODES} from "./WhiteboardConstants";
import {getWhiteboardsToPropagate} from "./WhiteboardUtils";
import {reconcileRoot} from "./WhiteboardReconciler";
import {WhiteboardNode} from "./WhiteboardNode";
import {$isElementNode} from "./nodes/ElementNode";
import {
    $garbageCollectDetachedDecorators,
    $garbageCollectDetachedNodes,
} from './WhiteboardGC';

let activeWhiteboardState: null | WhiteboardState = null;
let activeWhiteboard: null | Whiteboard = null;
let isAttemptingToRecoverFromReconcilerError = false;
let infiniteTransformCount = 0;

export type UpdateTagType = 'add-history' | 'history-merge' | string


export function errorOnInfiniteTransforms(): void {
    if (infiniteTransformCount > 99) {
        invariant(
            false,
            'One or more transforms are endlessly triggering additional transforms. May have encountered infinite recursion caused by transforms that have their preconditions too lose and/or conflict with each other.',
        );
    }
}

export function getActiveWhiteboardState(): WhiteboardState {
    if (activeWhiteboardState === null) {
        invariant(
            false,
            'Unable to find an active tab manager state. ' +
            'State helpers or node methods can only be used ' +
            'synchronously during the callback of ' +
            'whiteboard.update() or whiteboardState.read().',
        );
    }

    return activeWhiteboardState;
}
function setActiveWhiteboardState(whiteboardState: WhiteboardState | null){
    activeWhiteboardState = whiteboardState
}

export function getActiveWhiteboard(): Whiteboard {
    if (activeWhiteboard === null) {
        invariant(
            false,
            'Unable to find an active whiteboard. ' +
            'This method can only be used ' +
            'synchronously during the callback of ' +
            'whiteboard.update().',
        );
    }

    return activeWhiteboard;
}


export function readWhiteboardState<V>(
    whiteboardState: WhiteboardState,
    callbackFn: () => V,
): V {
    const previousActiveWhiteboardState = activeWhiteboardState;
    const previousActiveWhiteboard = activeWhiteboard;

    setActiveWhiteboardState(whiteboardState)
    activeWhiteboard = null;

    try {
        return callbackFn();
    } finally {
        setActiveWhiteboardState(previousActiveWhiteboardState)
        activeWhiteboard = previousActiveWhiteboard;
    }
}

function triggerDeferredUpdateCallbacks(
    whiteboard: Whiteboard,
    deferred: Array<() => void>,
): void {
    whiteboard._deferred = [];

    if (deferred.length !== 0) {
        const previouslyUpdating = whiteboard._updating;
        whiteboard._updating = true;

        try {
            for (let i = 0; i < deferred.length; i++) {
                deferred[i]();
            }
        } finally {
            whiteboard._updating = previouslyUpdating;
        }
    }
}

function triggerEnqueuedUpdates(whiteboard: Whiteboard): void {
    const queuedUpdates = whiteboard._updates;

    if (queuedUpdates.length !== 0) {
        const queuedUpdate = queuedUpdates.shift();
        if (queuedUpdate) {
            const [updateFn, options] = queuedUpdate;
            beginUpdate(whiteboard, updateFn, options);
        }
    }
}

export function commitPendingUpdates(whiteboard: Whiteboard): void {
    const pendingWhiteboardState = whiteboard._pendingWhiteboardState;
    const rootElement = whiteboard._rootElement;

    if ((rootElement === null) || pendingWhiteboardState === null) {
        return;
    }

    // ======
    // Reconciliation has started.
    // ======

    const currentWhiteboardState = whiteboard._whiteboardState;
    const currentSelection = currentWhiteboardState._selectionKey;
    const pendingSelection = pendingWhiteboardState._selectionKey;
    const needsUpdate = whiteboard._dirtyType !== NO_DIRTY_NODES;
    const previousActiveWhiteboardState = activeWhiteboardState;
    const previousActiveWhiteboard = activeWhiteboard;
    const previouslyUpdating = whiteboard._updating;
    let mutatedNodes = null;
    whiteboard._pendingWhiteboardState = null;
    whiteboard._whiteboardState = pendingWhiteboardState;

    if (needsUpdate) {
        activeWhiteboard = whiteboard;
        setActiveWhiteboardState(pendingWhiteboardState)
        // We don't want updates to sync block the reconciliation.
        whiteboard._updating = true;
        try {
            const dirtyType = whiteboard._dirtyType;
            const dirtyElements = whiteboard._dirtyElements;
            const dirtyLeaves = whiteboard._dirtyLeaves;
            mutatedNodes = reconcileRoot(
                currentWhiteboardState,
                pendingWhiteboardState,
                whiteboard,
                dirtyType,
                dirtyElements,
                dirtyLeaves,
            );
        } catch (error) {
            // Report errors
            if (error instanceof Error) {
                whiteboard._onError(error);
            }

            // Reset whiteboard and restore incoming whiteboard state to the DOM
            if (!isAttemptingToRecoverFromReconcilerError) {
                resetWhiteboard(whiteboard, null, rootElement, pendingWhiteboardState);
                whiteboard._dirtyType = FULL_RECONCILE;
                isAttemptingToRecoverFromReconcilerError = true;
                commitPendingUpdates(whiteboard);
                isAttemptingToRecoverFromReconcilerError = false;
            } else {
                // To avoid a possible situation of infinite loops, lets throw
                throw error;
            }

            return;
        } finally {
            whiteboard._updating = previouslyUpdating;
            setActiveWhiteboardState(previousActiveWhiteboardState)
            activeWhiteboard = previousActiveWhiteboard;
        }
    }


    /*if (__DEV__) {
        handleDEVOnlyPendingUpdateGuarantees(pendingWhiteboardState);
        if ($isRangeSelection(pendingSelection)) {
            Object.freeze(pendingSelection.anchor);
            Object.freeze(pendingSelection.focus);
        }
        Object.freeze(pendingSelection);
    }*/

    const dirtyLeaves = whiteboard._dirtyLeaves;
    const dirtyElements = whiteboard._dirtyElements;
    const tags = whiteboard._updateTags;

    const deferred = whiteboard._deferred;

    if (needsUpdate) {
        whiteboard._dirtyType = NO_DIRTY_NODES;
        whiteboard._cloneNotNeeded.clear();
        whiteboard._dirtyLeaves = new Set();
        whiteboard._dirtyElements = new Map();
        whiteboard._updateTags = new Set();
    }
    $garbageCollectDetachedDecorators(whiteboard, pendingWhiteboardState);

    // ======
    // Reconciliation has finished. Now update selection and trigger listeners.
    // ======


    if (mutatedNodes !== null) {
        triggerMutationListeners(
            whiteboard,
            currentWhiteboardState,
            pendingWhiteboardState,
            mutatedNodes,
            tags,
            dirtyLeaves,
        );
        triggerInheritableMutationListeners(
          whiteboard,
          currentWhiteboardState,
          pendingWhiteboardState,
          mutatedNodes,
          tags,
          dirtyLeaves,
        );
    }
    const pendingDecorators = whiteboard._pendingDecorators;
    if(pendingDecorators !== null) {
        whiteboard._decorators = pendingDecorators
        whiteboard._pendingDecorators = null;
        triggerListeners('decorator', whiteboard, true, pendingDecorators)
    }

    triggerListeners('update', whiteboard, true, {
        dirtyElements,
        dirtyLeaves,
        whiteboardState: pendingWhiteboardState,
        prevWhiteboardState: currentWhiteboardState,
        tags,
    });
    triggerDeferredUpdateCallbacks(whiteboard, deferred);
    triggerEnqueuedUpdates(whiteboard);
}

type InternalSerializedNode = {
    children?: Array<InternalSerializedNode>;
    type: string;
    version: number;
};

function $parseSerializedNodeImpl<
    SerializedNode extends InternalSerializedNode,
    >(
    serializedNode: SerializedNode,
    registeredNodes: RegisteredNodes,
): WhiteboardNode {
    const type = serializedNode.type;
    const registeredNode = registeredNodes.get(type);

    if (registeredNode === undefined) {
        invariant(false, 'parseWhiteboardState: type "%s" + not found', type);
    }

    const nodeClass = registeredNode.klass;

    if (serializedNode.type !== nodeClass.getType()) {
        invariant(
            false,
            'WhiteboardNode: Node %s does not implement .importJSON().',
            nodeClass.name,
        );
    }

    const node = nodeClass.importJSON(serializedNode);
    const children = serializedNode.children;

    if ($isElementNode(node) && Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            const serializedJSONChildNode = children[i];
            const childNode = $parseSerializedNodeImpl(
                serializedJSONChildNode,
                registeredNodes,
            );
            node.append(childNode);
        }
    }

    return node;
}

export function parseWhiteboardState(
    serializedWhiteboardState: SerializedWhiteboardState,
    whiteboard: Whiteboard,
    updateFn: void | (() => void),
): WhiteboardState {
    const whiteboardState = createEmptyWhiteboardState();
    const previousActiveWhiteboardState = activeWhiteboardState;
    const previousActiveWhiteboard = activeWhiteboard;
    const previousDirtyElements = whiteboard._dirtyElements;
    const previousDirtyLeaves = whiteboard._dirtyLeaves;
    const previousCloneNotNeeded = whiteboard._cloneNotNeeded;
    const previousDirtyType = whiteboard._dirtyType;
    whiteboard._dirtyElements = new Map();
    whiteboard._dirtyLeaves = new Set();
    whiteboard._cloneNotNeeded = new Set();
    whiteboard._dirtyType = 0;
    setActiveWhiteboardState(whiteboardState)
    activeWhiteboard = whiteboard;

    try {
        const registeredNodes = whiteboard._nodes;
        const serializedNode = serializedWhiteboardState.root;
        $parseSerializedNodeImpl(serializedNode, registeredNodes);
        if (updateFn) {
            updateFn();
        }

    } finally {
        whiteboard._dirtyElements = previousDirtyElements;
        whiteboard._dirtyLeaves = previousDirtyLeaves;
        whiteboard._cloneNotNeeded = previousCloneNotNeeded;
        whiteboard._dirtyType = previousDirtyType;
        setActiveWhiteboardState(previousActiveWhiteboardState)
        activeWhiteboard = previousActiveWhiteboard;
    }

    return whiteboardState;
}

function processNestedUpdates(
    whiteboard: Whiteboard,
    initialSkipTransforms?: boolean,
): boolean {
    const queuedUpdates = whiteboard._updates;
    let skipTransforms = initialSkipTransforms || false;

    // Updates might grow as we process them, we so we'll need
    // to handle each update as we go until the updates array is
    // empty.
    while (queuedUpdates.length !== 0) {
        const queuedUpdate = queuedUpdates.shift();
        if (queuedUpdate) {
            const [nextUpdateFn, options] = queuedUpdate;

            let onUpdate;
            let tag;

            if (options !== undefined) {
                onUpdate = options.onUpdate;
                tag = options.tag;

                if (options.skipTransforms) {
                    skipTransforms = true;
                }

                if (onUpdate) {
                    whiteboard._deferred.push(onUpdate);
                }

                if (tag) {
                    whiteboard._updateTags.add(tag);
                }
            }

            nextUpdateFn();
        }
    }

    return skipTransforms;
}

function beginUpdate(
    whiteboard: Whiteboard,
    updateFn: () => void,
    options?: WhiteboardUpdateOptions,
): void {
    const updateTags = whiteboard._updateTags;
    let onUpdate;
    let tag;
    let skipTransforms = false;

    if (options !== undefined) {
        onUpdate = options.onUpdate;
        tag = options.tag;

        if (tag != null) {
            updateTags.add(tag);
        }

        skipTransforms = options.skipTransforms || false;
    }

    if (onUpdate) {
        whiteboard._deferred.push(onUpdate);
    }

    const currentWhiteboardState = whiteboard._whiteboardState;
    let pendingWhiteboardState = whiteboard._pendingWhiteboardState;
    let whiteboardStateWasCloned = false;

    if (pendingWhiteboardState === null) {
        pendingWhiteboardState = whiteboard._pendingWhiteboardState =
            cloneWhiteboardState(currentWhiteboardState);
        whiteboardStateWasCloned = true;
    }

    const previousActiveWhiteboardState = activeWhiteboardState;
    const previousActiveWhiteboard = activeWhiteboard;
    const previouslyUpdating = whiteboard._updating;
    setActiveWhiteboardState(pendingWhiteboardState)
    whiteboard._updating = true;
    activeWhiteboard = whiteboard;

    try {
        if (whiteboardStateWasCloned) {
            pendingWhiteboardState._selectionKey = internalCreateSelection(whiteboard);
        }
        updateFn();
        skipTransforms = processNestedUpdates(whiteboard, skipTransforms);
        if (whiteboard._dirtyType !== NO_DIRTY_NODES) {
            /*if (skipTransforms) {
                $normalizeAllDirtyTextNodes(pendingEditorState, editor);
            } else {
                $applyAllTransforms(pendingEditorState, editor);
            }*/

            processNestedUpdates(whiteboard);
            $garbageCollectDetachedNodes(
                currentWhiteboardState,
                pendingWhiteboardState,
                whiteboard._dirtyLeaves,
                whiteboard._dirtyElements,
            );
        }




    } catch (error) {
        // Report errors
        if (error instanceof Error) {
            whiteboard._onError(error);
        }

        // Restore existing whiteboard state to the DOM
        whiteboard._pendingWhiteboardState = currentWhiteboardState;
        whiteboard._dirtyType = FULL_RECONCILE;

        whiteboard._cloneNotNeeded.clear();

        whiteboard._dirtyLeaves = new Set();

        whiteboard._dirtyElements.clear();


        commitPendingUpdates(whiteboard);
        return;
    } finally {
        setActiveWhiteboardState(previousActiveWhiteboardState)
        activeWhiteboard = previousActiveWhiteboard;
        whiteboard._updating = previouslyUpdating;
        infiniteTransformCount = 0;
    }

    const shouldUpdate =
        whiteboard._dirtyType !== NO_DIRTY_NODES ||
        whiteboardStateHasDirtySelection(pendingWhiteboardState, whiteboard);
    if (shouldUpdate) {
        commitPendingUpdates(whiteboard);
    } else {
        if (whiteboardStateWasCloned) {
            updateTags.clear();
            whiteboard._deferred = [];
            whiteboard._pendingWhiteboardState = null;
        }
    }
}

export function updateWhiteboard(
    whiteboard: Whiteboard,
    updateFn: () => void,
    options?: WhiteboardUpdateOptions
): void {
    if (whiteboard._updating) {
        whiteboard._updates.push([updateFn, options]);
    } else {
        beginUpdate(whiteboard, updateFn, options);
    }
}

function triggerMutationListeners(
    editor: Whiteboard,
    currentEditorState: WhiteboardState,
    pendingEditorState: WhiteboardState,
    mutatedNodes: MutatedNodes,
    updateTags: Set<UpdateTagType>,
    dirtyLeaves: Set<string>,
): void {
    const listeners = Array.from(editor._listeners.mutation);
    const listenersLength = listeners.length;

    for (let i = 0; i < listenersLength; i++) {
        const [listener, klass] = listeners[i];
        const mutatedNodesByType = mutatedNodes.get(klass);
        if (mutatedNodesByType !== undefined) {
            listener(mutatedNodesByType, {
                dirtyLeaves,
                updateTags,
            });
        }
    }
}

function triggerInheritableMutationListeners(
  editor: Whiteboard,
  currentEditorState: WhiteboardState,
  pendingEditorState: WhiteboardState,
  mutatedNodes: MutatedNodes,
  updateTags: Set<UpdateTagType>,
  dirtyLeaves: Set<string>,
): void {
    const listeners = Array.from(editor._listeners.inheritableMutation);
    const listenersLength = listeners.length;

    for (let i = 0; i < listenersLength; i++) {
        const [listener, klass] = listeners[i];
        for (const k of Array.from(mutatedNodes.keys())) {
            if (k.prototype instanceof klass || k === klass) {
                const mutatedNodesByType = mutatedNodes.get(k);
                if (mutatedNodesByType !== undefined) {
                    listener(mutatedNodesByType, {
                        dirtyLeaves,
                        updateTags,
                    });
                }
            }
        }

    }
}

export function triggerListeners(
    type: 'update' | 'decorator',
    whiteboard: Whiteboard,
    isCurrentlyEnqueuingUpdates: boolean,
    ...payload: unknown[]
): void {
    const previouslyUpdating = whiteboard._updating;
    whiteboard._updating = isCurrentlyEnqueuingUpdates;

    try {
        const listeners = Array.from<Listener>(whiteboard._listeners[type]);
        for (let i = 0; i < listeners.length; i++) {
            // @ts-ignore
            listeners[i].apply(null, payload);
        }
    } finally {
        whiteboard._updating = previouslyUpdating;
    }
}

export function triggerCommandListeners<P>(
    whiteboard: Whiteboard,
    type: WhiteboardCommand<P>,
    payload: P,
): boolean {
    if (whiteboard._updating === false || activeWhiteboard !== whiteboard) {
        let returnVal = false;
        whiteboard.update(() => {
            returnVal = triggerCommandListeners(whiteboard, type, payload);
        });
        return returnVal;
    }

    const whiteboards = getWhiteboardsToPropagate(whiteboard);

    for (let i = 4; i >= 0; i--) {
        for (let e = 0; e < whiteboards.length; e++) {
            const currentWhiteboard = whiteboards[e];
            const commandListeners = currentWhiteboard._commands;
            const listenerInPriorityOrder = commandListeners.get(type);

            if (listenerInPriorityOrder !== undefined) {
                const listenersSet = listenerInPriorityOrder[i];

                if (listenersSet !== undefined) {
                    const listeners = Array.from(listenersSet);
                    const listenersLength = listeners.length;

                    for (let j = 0; j < listenersLength; j++) {
                        if (listeners[j](payload, whiteboard) === true) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

export function internalGetActiveWhiteboard(): null | Whiteboard {
    return activeWhiteboard;
}
