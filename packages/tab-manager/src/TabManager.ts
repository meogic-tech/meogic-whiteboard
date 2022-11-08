import {NodeKey, TabManagerNode} from "./TabManagerNode";
import {createUID, dispatchCommand} from "./TabManagerUtils";
import {
    createEmptyTabManagerState,
    SerializedTabManagerState,
    TabManagerState
} from "./TabManagerState";
import invariant from "shared/invariant";
import {FULL_RECONCILE, NO_DIRTY_NODES} from "./TabManagerConstants";
import {
    commitPendingUpdates,
    internalGetActiveTabManager,
    parseTabManagerState,
    triggerListeners, updateTabManager
} from "./TabManagerUpdates";
// import {WindowNode} from "./nodes/WindowNode";
import {addRootElementEvents, removeRootElementEvents} from "./TabManagerEvents";
import {RootNode} from "./nodes/RootNode";
import {TabNode} from "./nodes/TabNode";
import {TabGroupNode} from "./nodes/TabGroupNode";


export type Spread<T1, T2> = Omit<T2, keyof T1> & T1;

export type Klass<T extends TabManagerNode> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
} & Omit<TabManagerNode, 'constructor'>;

export type TabManagerThemeClassName = string;


export type TabManagerThemeClasses = {
    window?: TabManagerThemeClassName,
    tab?: TabManagerThemeClassName,
    'tab-group'?: TabManagerThemeClassName,
    active?: TabManagerThemeClassName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export type TabManagerConfig = {
    namespace: string;
    theme: TabManagerThemeClasses;
};


export type RegisteredNodes = Map<string, RegisteredNode>;

export type RegisteredNode = {
    klass: Klass<TabManagerNode>;
}

export type RegisteredTabNode = {
    klass: Klass<TabNode<unknown>>;
}

export type RegisteredTabGroupNode = {
    klass: Klass<TabGroupNode>;
}

export type RegisteredTabNodes = Map<string, RegisteredTabNode>;

export type RegisteredTabGroupNodes = Map<string, RegisteredTabGroupNode>;

export type ErrorHandler = (error: Error) => void;

export type TabManagerUpdateOptions = {
    onUpdate?: () => void;
    skipTransforms?: true;
    tag?: string;
};

export type TabManagerSetOptions = {
    tag?: string;
};

export type UpdateListener = (arg0: {
    tabManagerState: TabManagerState;
    normalizedNodes: Set<NodeKey>;
    prevTabManagerState: TabManagerState;
    tags: Set<string>;
}) => void;

export type DecoratorListener<T = never> = (
    decorator: Record<NodeKey, T>,
) => void;

export type NodeMutation = 'created' | 'updated' | 'destroyed';

export type MutationListener = (
    nodes: Map<NodeKey, NodeMutation>,
    payload: {updateTags: Set<string>; dirtyLeaves: Set<string>},
) => void;

export type MutationListeners = Map<MutationListener, Klass<TabManagerNode>>;

export type MutatedNodes = Map<Klass<TabManagerNode>, Map<NodeKey, NodeMutation>>;

type Listeners = {
    decorator: Set<DecoratorListener>;
    update: Set<UpdateListener>;
    mutation: MutationListeners;
};

export type Listener =
    | DecoratorListener
    | MutationListener
    | UpdateListener;

export type ListenerType =
    | 'decorator'
    | 'mutation'
    | 'update'

export type CommandListener<P> = (payload: P, tabManager: TabManager) => boolean;

export type CommandListenerPriority = 0 | 1 | 2 | 3 | 4;

export const COMMAND_PRIORITY_TAB_MANAGER = 0;
export const COMMAND_PRIORITY_LOW = 1;
export const COMMAND_PRIORITY_NORMAL = 2;
export const COMMAND_PRIORITY_HIGH = 3;
export const COMMAND_PRIORITY_CRITICAL = 4;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TabManagerCommand<TPayload> = Record<string, never>;
/**
 * Type helper for extracting the payload type from a command.
 *
 * @example
 * ```ts
 * const MY_COMMAND = createCommand<SomeType>();
 *
 * // ...
 *
 * editor.registerCommand(MY_COMMAND, payload => {
 *   // Type of `payload` is inferred here. But lets say we want to extract a function to delegate to
 *   handleMyCommand(editor, payload);
 *   return true;
 * });
 *
 * function handleMyCommand(editor: TabManagerEditor, payload: CommandPayloadType<typeof MY_COMMAND>) {
 *   // `payload` is of type `SomeType`, extracted from the command.
 * }
 * ```
 */
export type CommandPayloadType<TCommand extends TabManagerCommand<unknown>> =
    TCommand extends TabManagerCommand<infer TPayload> ? TPayload : never;

type Commands = Map<
    TabManagerCommand<unknown>,
    Array<Set<CommandListener<unknown>>>
    >;

export function resetTabManager(
    tabManager: TabManager,
    prevRootElement: null | HTMLElement,
    nextRootElement: null | HTMLElement,
    pendingTabManagerState: TabManagerState,
): void {
    const keyNodeMap = tabManager._keyToDOMMap;
    keyNodeMap.clear();
    tabManager._tabManagerState = createEmptyTabManagerState();
    tabManager._pendingTabManagerState = pendingTabManagerState;
    tabManager._dirtyType = NO_DIRTY_NODES;
    tabManager._cloneNotNeeded.clear();
    tabManager._dirtyLeaves = new Set();
    tabManager._dirtyElements.clear();
    tabManager._updateTags = new Set();
    tabManager._updates = [];

    // Remove all the DOM nodes from the root element
    if (prevRootElement !== null) {
        prevRootElement.textContent = '';
    }

    if (nextRootElement !== null) {
        nextRootElement.textContent = '';
        keyNodeMap.set('root', nextRootElement);
    }
}

export function createTabManager(tabManagerConfig?: {
    tabManagerState?: TabManagerState;
    namespace?: string;
    nodes?: ReadonlyArray<Klass<TabManagerNode>>;
    tabNodes?: ReadonlyArray<Klass<TabNode<unknown>>>;
    tabGroupNodes?: ReadonlyArray<Klass<TabGroupNode>>;
    onError?: ErrorHandler;
    readOnly?: boolean;
    theme?: TabManagerThemeClasses;
}): TabManager {
    const config = tabManagerConfig || {};
    const activeTabManager = internalGetActiveTabManager();
    const theme = config.theme || {};
    const editorState = createEmptyTabManagerState();
    const namespace =
        config.namespace || createUID();
    const initialTabManagerState = config.tabManagerState;
    const nodes = [
        RootNode,
        // WindowNode,
        ...(config.nodes || []),
    ];
    const onError = config.onError;
    const isReadOnly = config.readOnly || false;
    let registeredNodes;

    if (tabManagerConfig === undefined && activeTabManager !== null) {
        registeredNodes = activeTabManager._nodes;
    } else {
        registeredNodes = new Map();
        for (let i = 0; i < nodes.length; i++) {
            const klass = nodes[i];
            // Ensure custom nodes implement required methods.
            if (__DEV__) {
                const name = klass.name;
                const proto = klass.prototype;
                ['getType', 'clone'].forEach((method) => {
                    // eslint-disable-next-line no-prototype-builtins
                    if (!klass.hasOwnProperty(method)) {
                        console.warn(`${name} must implement static "${method}" method`);
                    }
                });
                if (
                    // eslint-disable-next-line no-prototype-builtins
                    !klass.hasOwnProperty('importDOM') &&
                    // eslint-disable-next-line no-prototype-builtins
                    klass.hasOwnProperty('exportDOM')
                ) {
                    console.warn(
                        `${name} should implement "importDOM" if using a custom "exportDOM" method to ensure HTML serialization (important for copy & paste) works as expected`,
                    );
                }
                if (
                    // eslint-disable-next-line no-prototype-builtins
                    !klass.hasOwnProperty('importJSON')
                ) {
                    console.warn(
                        `${name} should implement "importJSON" method to ensure JSON and default HTML serialization works as expected`,
                    );
                }
                if (
                    // eslint-disable-next-line no-prototype-builtins
                    !proto.hasOwnProperty('exportJSON')
                ) {
                    console.warn(
                        `${name} should implement "exportJSON" method to ensure JSON and default HTML serialization works as expected`,
                    );
                }
            }
            const type = klass.getType();
            registeredNodes.set(type, {
                klass,
                transforms: new Set(),
            });
        }
    }
    let registeredTabNodes = new Map();
    if(config.tabNodes){
        for (let i = 0; i < config.tabNodes.length; i++) {
            const klass = config.tabNodes[i]
            const type = klass.getType();
            registeredTabNodes.set(type, {
                klass
            })
        }
    }

    let registeredTabGroupNodes = new Map();
    if(config.tabGroupNodes){
        for (let i = 0; i < config.tabGroupNodes.length; i++) {
            const klass = config.tabGroupNodes[i]
            const type = klass.getType();
            registeredTabGroupNodes.set(type, {
                klass
            })
        }
    }


    const editor = new TabManager(
        editorState,
        registeredNodes,
        registeredTabNodes,
        registeredTabGroupNodes,
        {
            namespace,
            theme,
        },
        onError ? onError : console.error
    );

    if (initialTabManagerState !== undefined) {
        editor._pendingTabManagerState = initialTabManagerState;
        editor._dirtyType = FULL_RECONCILE;
    }

    return editor;
}
export type IntentionallyMarkedAsDirtyElement = boolean;
export type SerializedTabManager = {
    tabManagerState: SerializedTabManagerState;
};
export class TabManager {
    _rootElement: null | HTMLElement;
    _key: string;
    _config: TabManagerConfig;
    _tabManagerState: TabManagerState;
    _pendingTabManagerState: null | TabManagerState;
    _keyToDOMMap: Map<NodeKey, HTMLElement>;
    _onError: ErrorHandler;
    _updates: Array<[() => void, TabManagerUpdateOptions | undefined]>;
    _updating: boolean;
    _listeners: Listeners;
    _commands: Commands;
    _nodes: RegisteredNodes;
    _tabNodes: RegisteredTabNodes;
    _tabGroupNodes: RegisteredTabGroupNodes;
    _decorators: Record<NodeKey, unknown>;
    _pendingDecorators: null | Record<NodeKey, unknown>;
    _updateTags: Set<string>;
    _deferred: Array<() => void>;
    _dirtyType: 0 | 1 | 2;
    _cloneNotNeeded: Set<NodeKey>;
    _dirtyLeaves: Set<NodeKey>;
    _dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>;

    constructor(
        tabManagerState: TabManagerState,
        nodes: RegisteredNodes,
        tabNodes: RegisteredTabNodes,
        tabGroupNodes: RegisteredTabGroupNodes,
        config: TabManagerConfig,
        onError: ErrorHandler,
    ) {
        // The current editor state
        this._tabManagerState = tabManagerState;
        // The root element associated with this editor
        this._rootElement = null;
        this._pendingTabManagerState = null

        // Used during reconciliation
        this._keyToDOMMap = new Map();
        this._updates = [];
        this._updating = false;
        // Listeners
        this._listeners = {
            decorator: new Set(),
            update: new Set(),
            mutation: new Map()
        };
        // Commands
        this._commands = new Map();
        this._config = config
        this._deferred = [];
        // Mapping of types to their nodes
        this._nodes = nodes
        this._tabNodes = tabNodes
        this._tabGroupNodes = tabGroupNodes
        this._decorators = {};
        this._pendingDecorators = null;
        this._dirtyType = NO_DIRTY_NODES;
        this._cloneNotNeeded = new Set();
        this._dirtyLeaves = new Set();
        this._dirtyElements = new Map();

        this._updateTags = new Set();
        // Used for identifying owning editors
        this._key = createUID();

        this._onError = onError;
    }

    registerDecoratorListener<T>(listener: DecoratorListener<T>): () => void {
        const listenerSetOrMap = this._listeners.decorator;
        listenerSetOrMap.add(listener);
        return () => {
            listenerSetOrMap.delete(listener);
        };
    }

    registerUpdateListener(listener: UpdateListener): () => void {
        const listenerSetOrMap = this._listeners.update;
        listenerSetOrMap.add(listener);
        return () => {
            listenerSetOrMap.delete(listener);
        };
    }

    registerMutationListener(
        klass: Klass<TabManagerNode>,
        listener: MutationListener,
    ): () => void {
        const registeredNode = this._nodes.get(klass.getType());

        if (registeredNode === undefined) {
            invariant(
                false,
                'Node %s has not been registered. Ensure node has been passed to createEditor.',
                klass.name,
            );
        }

        const mutations = this._listeners.mutation;
        mutations.set(listener, klass);
        return () => {
            mutations.delete(listener);
        };
    }

    registerCommand<P>(
        command: TabManagerCommand<P>,
        listener: CommandListener<P>,
        priority: CommandListenerPriority,
    ): () => void {
        if (priority === undefined) {
            invariant(false, 'Listener for type "command" requires a "priority".');
        }

        const commandsMap = this._commands;

        if (!commandsMap.has(command)) {
            commandsMap.set(command, [
                new Set(),
                new Set(),
                new Set(),
                new Set(),
                new Set(),
            ]);
        }

        const listenersInPriorityOrder = commandsMap.get(command);

        if (listenersInPriorityOrder === undefined) {
            invariant(
                false,
                'registerCommand: Command %s not found in command map',
                String(command),
            );
        }

        const listeners = listenersInPriorityOrder[priority];
        listeners.add(listener as CommandListener<unknown>);
        return () => {
            listeners.delete(listener as CommandListener<unknown>);

            if (
                listenersInPriorityOrder.every(
                    (listenersSet) => listenersSet.size === 0,
                )
            ) {
                commandsMap.delete(command);
            }
        };
    }

    dispatchCommand<
        TCommand extends TabManagerCommand<unknown>,
        TPayload extends CommandPayloadType<TCommand>,
        >(type: TCommand, payload: TPayload): boolean {
        return dispatchCommand(this, type, payload);
    }



    getDecorators<T>(): Record<NodeKey, T> {
        return this._decorators as Record<NodeKey, T>;
    }

    getRegisteredTabNodes(){
        return this._tabNodes
    }

    getRegisteredTabGroupNodes() {
        return this._tabGroupNodes
    }

    getRootElement(): null | HTMLElement {
        return this._rootElement;
    }

    getKey(): string {
        return this._key;
    }

    setRootElement(nextRootElement: null | HTMLElement): void {
        const prevRootElement = this._rootElement;

        if (nextRootElement !== prevRootElement) {
            const pendingEditorState = this._pendingTabManagerState || this._tabManagerState;
            this._rootElement = nextRootElement;
            resetTabManager(this, prevRootElement, nextRootElement, pendingEditorState);

            if (prevRootElement !== null) {
                removeRootElementEvents(prevRootElement);
            }

            if (nextRootElement !== null) {
                this._dirtyType = FULL_RECONCILE;

                this._updateTags.add('history-merge');

                commitPendingUpdates(this);

                addRootElementEvents(nextRootElement, this);
            }

        }
    }

    getElementByKey(key: NodeKey): HTMLElement | null {
        return this._keyToDOMMap.get(key) || null;
    }

    getTabManagerState(): TabManagerState {
        return this._tabManagerState;
    }

    setTabManagerState(tabManagerState: TabManagerState, options?: TabManagerSetOptions): void {
        if (tabManagerState.isEmpty()) {
            invariant(
                false,
                "setEditorState: the editor state is empty. Ensure the editor state's root node never becomes empty.",
            );
        }

        const pendingTabManagerState = this._pendingTabManagerState;
        const tags = this._updateTags;
        const tag = options !== undefined ? options.tag : null;

        if (pendingTabManagerState !== null && !pendingTabManagerState.isEmpty()) {
            if (tag != null) {
                tags.add(tag);
            }

            commitPendingUpdates(this);
        }

        this._pendingTabManagerState = tabManagerState;
        this._dirtyType = FULL_RECONCILE;
        this._dirtyElements.set('root', false);

        if (tag != null) {
            tags.add(tag);
        }

        commitPendingUpdates(this);
    }



    parseTabManagerState(
        maybeStringifiedEditorState: string | SerializedTabManagerState,
        updateFn?: () => void,
    ): TabManagerState {
        const serializedEditorState =
            typeof maybeStringifiedEditorState === 'string'
                ? JSON.parse(maybeStringifiedEditorState)
                : maybeStringifiedEditorState;
        return parseTabManagerState(serializedEditorState, this, updateFn);
    }

    update(updateFn: () => void, options?: TabManagerUpdateOptions): void {
        updateTabManager(this, updateFn, options);
    }



    toJSON(): SerializedTabManager {
        return {
            tabManagerState: this._tabManagerState.toJSON(),
        };
    }
}
