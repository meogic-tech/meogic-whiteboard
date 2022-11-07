import {
    cloneTabManagerState, createEmptyTabManagerState,
    SerializedTabManagerState,
    TabManagerState,
    tabManagerStateHasDirtySelection
} from "./TabManagerState";
import invariant from "shared/invariant";
import {
    Listener,
    ListenerType, MutatedNodes,
    RegisteredNodes,
    resetTabManager,
    TabManager,
    TabManagerCommand,
    TabManagerUpdateOptions,
    UpdateListener
} from "./TabManager";
import {internalCreateSelection} from "./TabManagerSelection";
import {FULL_RECONCILE, NO_DIRTY_NODES} from "./TabManagerConstants";
import {getTabManagersToPropagate} from "./TabManagerUtils";
import {reconcileRoot} from "./TabManagerReconciler";
import {TabManagerNode} from "./TabManagerNode";
import {$isElementNode} from "./nodes/ElementNode";
import {
    $garbageCollectDetachedDecorators,
    $garbageCollectDetachedNodes,
} from './TabManagerGC';

let activeTabManagerState: null | TabManagerState = null;
let activeTabManager: null | TabManager = null;
let isAttemptingToRecoverFromReconcilerError = false;
let infiniteTransformCount = 0;



export function errorOnInfiniteTransforms(): void {
    if (infiniteTransformCount > 99) {
        invariant(
            false,
            'One or more transforms are endlessly triggering additional transforms. May have encountered infinite recursion caused by transforms that have their preconditions too lose and/or conflict with each other.',
        );
    }
}

export function getActiveTabManagerState(): TabManagerState {
    if (activeTabManagerState === null) {
        invariant(
            false,
            'Unable to find an active tab manager state. ' +
            'State helpers or node methods can only be used ' +
            'synchronously during the callback of ' +
            'tabManager.update() or tabManagerState.read().',
        );
    }

    return activeTabManagerState;
}
function setActiveTabManagerState(tabManagerState: TabManagerState | null){
    activeTabManagerState = tabManagerState
}

export function getActiveTabManager(): TabManager {
    if (activeTabManager === null) {
        invariant(
            false,
            'Unable to find an active tabManager. ' +
            'This method can only be used ' +
            'synchronously during the callback of ' +
            'tabManager.update().',
        );
    }

    return activeTabManager;
}


export function readTabManagerState<V>(
    tabManagerState: TabManagerState,
    callbackFn: () => V,
): V {
    const previousActiveTabManagerState = activeTabManagerState;
    const previousActiveTabManager = activeTabManager;

    setActiveTabManagerState(tabManagerState)
    activeTabManager = null;

    try {
        return callbackFn();
    } finally {
        setActiveTabManagerState(previousActiveTabManagerState)
        activeTabManager = previousActiveTabManager;
    }
}

function triggerDeferredUpdateCallbacks(
    tabManager: TabManager,
    deferred: Array<() => void>,
): void {
    tabManager._deferred = [];

    if (deferred.length !== 0) {
        const previouslyUpdating = tabManager._updating;
        tabManager._updating = true;

        try {
            for (let i = 0; i < deferred.length; i++) {
                deferred[i]();
            }
        } finally {
            tabManager._updating = previouslyUpdating;
        }
    }
}

function triggerEnqueuedUpdates(tabManager: TabManager): void {
    const queuedUpdates = tabManager._updates;

    if (queuedUpdates.length !== 0) {
        const queuedUpdate = queuedUpdates.shift();
        if (queuedUpdate) {
            const [updateFn, options] = queuedUpdate;
            beginUpdate(tabManager, updateFn, options);
        }
    }
}

export function commitPendingUpdates(tabManager: TabManager): void {
    const pendingTabManagerState = tabManager._pendingTabManagerState;
    const rootElement = tabManager._rootElement;

    if ((rootElement === null) || pendingTabManagerState === null) {
        return;
    }

    // ======
    // Reconciliation has started.
    // ======

    const currentTabManagerState = tabManager._tabManagerState;
    const currentSelection = currentTabManagerState._selectionKey;
    const pendingSelection = pendingTabManagerState._selectionKey;
    const needsUpdate = tabManager._dirtyType !== NO_DIRTY_NODES;
    const previousActiveTabManagerState = activeTabManagerState;
    const previousActiveTabManager = activeTabManager;
    const previouslyUpdating = tabManager._updating;
    let mutatedNodes = null;
    tabManager._pendingTabManagerState = null;
    tabManager._tabManagerState = pendingTabManagerState;

    if (needsUpdate) {
        activeTabManager = tabManager;
        setActiveTabManagerState(pendingTabManagerState)
        // We don't want updates to sync block the reconciliation.
        tabManager._updating = true;
        try {
            const dirtyType = tabManager._dirtyType;
            const dirtyElements = tabManager._dirtyElements;
            const dirtyLeaves = tabManager._dirtyLeaves;
            mutatedNodes = reconcileRoot(
                currentTabManagerState,
                pendingTabManagerState,
                tabManager,
                dirtyType,
                dirtyElements,
                dirtyLeaves,
            );
        } catch (error) {
            // Report errors
            if (error instanceof Error) {
                tabManager._onError(error);
            }

            // Reset tabManager and restore incoming tabManager state to the DOM
            if (!isAttemptingToRecoverFromReconcilerError) {
                resetTabManager(tabManager, null, rootElement, pendingTabManagerState);
                tabManager._dirtyType = FULL_RECONCILE;
                isAttemptingToRecoverFromReconcilerError = true;
                commitPendingUpdates(tabManager);
                isAttemptingToRecoverFromReconcilerError = false;
            } else {
                // To avoid a possible situation of infinite loops, lets throw
                throw error;
            }

            return;
        } finally {
            tabManager._updating = previouslyUpdating;
            setActiveTabManagerState(previousActiveTabManagerState)
            activeTabManager = previousActiveTabManager;
        }
    }


    /*if (__DEV__) {
        handleDEVOnlyPendingUpdateGuarantees(pendingTabManagerState);
        if ($isRangeSelection(pendingSelection)) {
            Object.freeze(pendingSelection.anchor);
            Object.freeze(pendingSelection.focus);
        }
        Object.freeze(pendingSelection);
    }*/

    const dirtyLeaves = tabManager._dirtyLeaves;
    const dirtyElements = tabManager._dirtyElements;
    const tags = tabManager._updateTags;
    const pendingDecorators = tabManager._pendingDecorators;
    const deferred = tabManager._deferred;

    if (needsUpdate) {
        tabManager._dirtyType = NO_DIRTY_NODES;
        tabManager._cloneNotNeeded.clear();
        tabManager._dirtyLeaves = new Set();
        tabManager._dirtyElements = new Map();
        tabManager._updateTags = new Set();
    }
    $garbageCollectDetachedDecorators(tabManager, pendingTabManagerState);

    // ======
    // Reconciliation has finished. Now update selection and trigger listeners.
    // ======


    if (mutatedNodes !== null) {
        triggerMutationListeners(
            tabManager,
            currentTabManagerState,
            pendingTabManagerState,
            mutatedNodes,
            tags,
            dirtyLeaves,
        );
    }

    if(pendingDecorators !== null) {
        tabManager._decorators = pendingDecorators
        tabManager._pendingDecorators = null;
        triggerListeners('decorator', tabManager, true, pendingDecorators)
    }

    triggerListeners('update', tabManager, true, {
        dirtyElements,
        dirtyLeaves,
        tabManagerState: pendingTabManagerState,
        prevTabManagerState: currentTabManagerState,
        tags,
    });
    triggerDeferredUpdateCallbacks(tabManager, deferred);
    triggerEnqueuedUpdates(tabManager);
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
): TabManagerNode {
    const type = serializedNode.type;
    const registeredNode = registeredNodes.get(type);

    if (registeredNode === undefined) {
        invariant(false, 'parseTabManagerState: type "%s" + not found', type);
    }

    const nodeClass = registeredNode.klass;

    if (serializedNode.type !== nodeClass.getType()) {
        invariant(
            false,
            'TabManagerNode: Node %s does not implement .importJSON().',
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

export function parseTabManagerState(
    serializedTabManagerState: SerializedTabManagerState,
    tabManager: TabManager,
    updateFn: void | (() => void),
): TabManagerState {
    const tabManagerState = createEmptyTabManagerState();
    const previousActiveTabManagerState = activeTabManagerState;
    const previousActiveTabManager = activeTabManager;
    const previousDirtyElements = tabManager._dirtyElements;
    const previousDirtyLeaves = tabManager._dirtyLeaves;
    const previousCloneNotNeeded = tabManager._cloneNotNeeded;
    const previousDirtyType = tabManager._dirtyType;
    tabManager._dirtyElements = new Map();
    tabManager._dirtyLeaves = new Set();
    tabManager._cloneNotNeeded = new Set();
    tabManager._dirtyType = 0;
    setActiveTabManagerState(tabManagerState)
    activeTabManager = tabManager;

    try {
        const registeredNodes = tabManager._nodes;
        const serializedNode = serializedTabManagerState.root;
        $parseSerializedNodeImpl(serializedNode, registeredNodes);
        if (updateFn) {
            updateFn();
        }

    } finally {
        tabManager._dirtyElements = previousDirtyElements;
        tabManager._dirtyLeaves = previousDirtyLeaves;
        tabManager._cloneNotNeeded = previousCloneNotNeeded;
        tabManager._dirtyType = previousDirtyType;
        setActiveTabManagerState(previousActiveTabManagerState)
        activeTabManager = previousActiveTabManager;
    }

    return tabManagerState;
}

function processNestedUpdates(
    tabManager: TabManager,
    initialSkipTransforms?: boolean,
): boolean {
    const queuedUpdates = tabManager._updates;
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
                    tabManager._deferred.push(onUpdate);
                }

                if (tag) {
                    tabManager._updateTags.add(tag);
                }
            }

            nextUpdateFn();
        }
    }

    return skipTransforms;
}

function beginUpdate(
    tabManager: TabManager,
    updateFn: () => void,
    options?: TabManagerUpdateOptions,
): void {
    const updateTags = tabManager._updateTags;
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
        tabManager._deferred.push(onUpdate);
    }

    const currentTabManagerState = tabManager._tabManagerState;
    let pendingTabManagerState = tabManager._pendingTabManagerState;
    let tabManagerStateWasCloned = false;

    if (pendingTabManagerState === null) {
        pendingTabManagerState = tabManager._pendingTabManagerState =
            cloneTabManagerState(currentTabManagerState);
        tabManagerStateWasCloned = true;
    }

    const previousActiveTabManagerState = activeTabManagerState;
    const previousActiveTabManager = activeTabManager;
    const previouslyUpdating = tabManager._updating;
    setActiveTabManagerState(pendingTabManagerState)
    tabManager._updating = true;
    activeTabManager = tabManager;

    try {
        if (tabManagerStateWasCloned) {
            pendingTabManagerState._selectionKey = internalCreateSelection(tabManager);
        }
        updateFn();
        skipTransforms = processNestedUpdates(tabManager, skipTransforms);
        if (tabManager._dirtyType !== NO_DIRTY_NODES) {
            /*if (skipTransforms) {
                $normalizeAllDirtyTextNodes(pendingEditorState, editor);
            } else {
                $applyAllTransforms(pendingEditorState, editor);
            }*/

            processNestedUpdates(tabManager);
            $garbageCollectDetachedNodes(
                currentTabManagerState,
                pendingTabManagerState,
                tabManager._dirtyLeaves,
                tabManager._dirtyElements,
            );
        }




    } catch (error) {
        // Report errors
        if (error instanceof Error) {
            tabManager._onError(error);
        }

        // Restore existing tabManager state to the DOM
        tabManager._pendingTabManagerState = currentTabManagerState;
        tabManager._dirtyType = FULL_RECONCILE;

        tabManager._cloneNotNeeded.clear();

        tabManager._dirtyLeaves = new Set();

        tabManager._dirtyElements.clear();


        commitPendingUpdates(tabManager);
        return;
    } finally {
        setActiveTabManagerState(previousActiveTabManagerState)
        activeTabManager = previousActiveTabManager;
        tabManager._updating = previouslyUpdating;
        infiniteTransformCount = 0;
    }

    const shouldUpdate =
        tabManager._dirtyType !== NO_DIRTY_NODES ||
        tabManagerStateHasDirtySelection(pendingTabManagerState, tabManager);
    if (shouldUpdate) {
        commitPendingUpdates(tabManager);
    } else {
        if (tabManagerStateWasCloned) {
            updateTags.clear();
            tabManager._deferred = [];
            tabManager._pendingTabManagerState = null;
        }
    }
}

export function updateTabManager(
    tabManager: TabManager,
    updateFn: () => void,
    options?: TabManagerUpdateOptions
): void {
    if (tabManager._updating) {
        tabManager._updates.push([updateFn, options]);
    } else {
        beginUpdate(tabManager, updateFn, options);
    }
}

function triggerMutationListeners(
    editor: TabManager,
    currentEditorState: TabManagerState,
    pendingEditorState: TabManagerState,
    mutatedNodes: MutatedNodes,
    updateTags: Set<string>,
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

export function triggerListeners(
    type: 'update' | 'decorator',
    tabManager: TabManager,
    isCurrentlyEnqueuingUpdates: boolean,
    ...payload: unknown[]
): void {
    const previouslyUpdating = tabManager._updating;
    tabManager._updating = isCurrentlyEnqueuingUpdates;

    try {
        const listeners = Array.from<Listener>(tabManager._listeners[type]);
        for (let i = 0; i < listeners.length; i++) {
            // @ts-ignore
            listeners[i].apply(null, payload);
        }
    } finally {
        tabManager._updating = previouslyUpdating;
    }
}

export function triggerCommandListeners<P>(
    tabManager: TabManager,
    type: TabManagerCommand<P>,
    payload: P,
): boolean {
    if (tabManager._updating === false || activeTabManager !== tabManager) {
        let returnVal = false;
        tabManager.update(() => {
            returnVal = triggerCommandListeners(tabManager, type, payload);
        });
        return returnVal;
    }

    const tabManagers = getTabManagersToPropagate(tabManager);

    for (let i = 4; i >= 0; i--) {
        for (let e = 0; e < tabManagers.length; e++) {
            const currentTabManager = tabManagers[e];
            const commandListeners = currentTabManager._commands;
            const listenerInPriorityOrder = commandListeners.get(type);

            if (listenerInPriorityOrder !== undefined) {
                const listenersSet = listenerInPriorityOrder[i];

                if (listenersSet !== undefined) {
                    const listeners = Array.from(listenersSet);
                    const listenersLength = listeners.length;

                    for (let j = 0; j < listenersLength; j++) {
                        if (listeners[j](payload, tabManager) === true) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

export function internalGetActiveTabManager(): null | TabManager {
    return activeTabManager;
}
