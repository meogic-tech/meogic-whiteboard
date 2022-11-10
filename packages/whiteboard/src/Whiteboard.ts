import {NodeKey, WhiteboardNode} from "./WhiteboardNode";
import {createUID, dispatchCommand} from "./WhiteboardUtils";
import {
    createEmptyWhiteboardState,
    SerializedWhiteboardState,
    WhiteboardState
} from "./WhiteboardState";
import invariant from "shared/invariant";
import {FULL_RECONCILE, NO_DIRTY_NODES} from "./WhiteboardConstants";
import {
    commitPendingUpdates,
    internalGetActiveWhiteboard,
    parseWhiteboardState,
    triggerListeners, updateWhiteboard
} from "./WhiteboardUpdates";
// import {WindowNode} from "./nodes/WindowNode";
import {addRootElementEvents, removeRootElementEvents} from "./WhiteboardEvents";
import {RootNode} from "./nodes/RootNode";


export type Spread<T1, T2> = Omit<T2, keyof T1> & T1;

export type Klass<T extends WhiteboardNode> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
} & Omit<WhiteboardNode, 'constructor'>;

export type WhiteboardThemeClassName = string;


export type WhiteboardThemeClasses = {
    active?: WhiteboardThemeClassName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export type WhiteboardConfig = {
    namespace: string;
    theme: WhiteboardThemeClasses;
};


export type RegisteredNodes = Map<string, RegisteredNode>;

export type RegisteredNode = {
    klass: Klass<WhiteboardNode>;
}


export type ErrorHandler = (error: Error) => void;

export type WhiteboardUpdateOptions = {
    onUpdate?: () => void;
    skipTransforms?: true;
    tag?: string;
};

export type WhiteboardSetOptions = {
    tag?: string;
};

export type UpdateListener = (arg0: {
    whiteboardState: WhiteboardState;
    normalizedNodes: Set<NodeKey>;
    prevWhiteboardState: WhiteboardState;
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

export type MutationListeners = Map<MutationListener, Klass<WhiteboardNode>>;

export type MutatedNodes = Map<Klass<WhiteboardNode>, Map<NodeKey, NodeMutation>>;

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

export type CommandListener<P> = (payload: P, whiteboard: Whiteboard) => boolean;

export type CommandListenerPriority = 0 | 1 | 2 | 3 | 4;

export const COMMAND_PRIORITY_WHITEBOARD = 0;
export const COMMAND_PRIORITY_LOW = 1;
export const COMMAND_PRIORITY_NORMAL = 2;
export const COMMAND_PRIORITY_HIGH = 3;
export const COMMAND_PRIORITY_CRITICAL = 4;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type WhiteboardCommand<TPayload> = Record<string, never>;
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
 * function handleMyCommand(editor: WhiteboardEditor, payload: CommandPayloadType<typeof MY_COMMAND>) {
 *   // `payload` is of type `SomeType`, extracted from the command.
 * }
 * ```
 */
export type CommandPayloadType<TCommand extends WhiteboardCommand<unknown>> =
    TCommand extends WhiteboardCommand<infer TPayload> ? TPayload : never;

type Commands = Map<
    WhiteboardCommand<unknown>,
    Array<Set<CommandListener<unknown>>>
    >;

export function resetWhiteboard(
    whiteboard: Whiteboard,
    prevRootElement: null | HTMLElement,
    nextRootElement: null | HTMLElement,
    pendingWhiteboardState: WhiteboardState,
): void {
    const keyNodeMap = whiteboard._keyToDOMMap;
    keyNodeMap.clear();
    whiteboard._whiteboardState = createEmptyWhiteboardState();
    whiteboard._pendingWhiteboardState = pendingWhiteboardState;
    whiteboard._dirtyType = NO_DIRTY_NODES;
    whiteboard._cloneNotNeeded.clear();
    whiteboard._dirtyLeaves = new Set();
    whiteboard._dirtyElements.clear();
    whiteboard._updateTags = new Set();
    whiteboard._updates = [];

    // Remove all the DOM nodes from the root element
    if (prevRootElement !== null) {
        prevRootElement.textContent = '';
    }

    if (nextRootElement !== null) {
        nextRootElement.textContent = '';
        keyNodeMap.set('root', nextRootElement);
    }
}

export function createWhiteboard(whiteboardConfig?: {
    whiteboardState?: WhiteboardState;
    namespace?: string;
    nodes?: ReadonlyArray<Klass<WhiteboardNode>>;
    onError?: ErrorHandler;
    readOnly?: boolean;
    theme?: WhiteboardThemeClasses;
}): Whiteboard {
    const config = whiteboardConfig || {};
    const activeWhiteboard = internalGetActiveWhiteboard();
    const theme = config.theme || {};
    const editorState = createEmptyWhiteboardState();
    const namespace =
        config.namespace || createUID();
    const initialWhiteboardState = config.whiteboardState;
    const nodes = [
        RootNode,
        // WindowNode,
        ...(config.nodes || []),
    ];
    const onError = config.onError;
    const isReadOnly = config.readOnly || false;
    let registeredNodes;

    if (whiteboardConfig === undefined && activeWhiteboard !== null) {
        registeredNodes = activeWhiteboard._nodes;
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


    const editor = new Whiteboard(
        editorState,
        registeredNodes,
        {
            namespace,
            theme,
        },
        onError ? onError : console.error
    );

    if (initialWhiteboardState !== undefined) {
        editor._pendingWhiteboardState = initialWhiteboardState;
        editor._dirtyType = FULL_RECONCILE;
    }

    return editor;
}
export type IntentionallyMarkedAsDirtyElement = boolean;
export type SerializedWhiteboard = {
    whiteboardState: SerializedWhiteboardState;
};
export class Whiteboard {
    _rootElement: null | HTMLElement;
    _key: string;
    _config: WhiteboardConfig;
    _whiteboardState: WhiteboardState;
    _pendingWhiteboardState: null | WhiteboardState;
    _keyToDOMMap: Map<NodeKey, HTMLElement>;
    _onError: ErrorHandler;
    _updates: Array<[() => void, WhiteboardUpdateOptions | undefined]>;
    _updating: boolean;
    _listeners: Listeners;
    _commands: Commands;
    _nodes: RegisteredNodes;
    _decorators: Record<NodeKey, unknown>;
    _pendingDecorators: null | Record<NodeKey, unknown>;
    _updateTags: Set<string>;
    _deferred: Array<() => void>;
    _dirtyType: 0 | 1 | 2;
    _cloneNotNeeded: Set<NodeKey>;
    _dirtyLeaves: Set<NodeKey>;
    _dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>;

    constructor(
        whiteboardState: WhiteboardState,
        nodes: RegisteredNodes,
        config: WhiteboardConfig,
        onError: ErrorHandler,
    ) {
        // The current editor state
        this._whiteboardState = whiteboardState;
        // The root element associated with this editor
        this._rootElement = null;
        this._pendingWhiteboardState = null

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
        klass: Klass<WhiteboardNode>,
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
        command: WhiteboardCommand<P>,
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
        TCommand extends WhiteboardCommand<unknown>,
        TPayload extends CommandPayloadType<TCommand>,
        >(type: TCommand, payload: TPayload): boolean {
        return dispatchCommand(this, type, payload);
    }



    getDecorators<T>(): Record<NodeKey, T> {
        return this._decorators as Record<NodeKey, T>;
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
            const pendingEditorState = this._pendingWhiteboardState || this._whiteboardState;
            this._rootElement = nextRootElement;
            resetWhiteboard(this, prevRootElement, nextRootElement, pendingEditorState);

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

    getWhiteboardState(): WhiteboardState {
        return this._whiteboardState;
    }

    setWhiteboardState(whiteboardState: WhiteboardState, options?: WhiteboardSetOptions): void {
        if (whiteboardState.isEmpty()) {
            invariant(
                false,
                "setEditorState: the editor state is empty. Ensure the editor state's root node never becomes empty.",
            );
        }

        const pendingWhiteboardState = this._pendingWhiteboardState;
        const tags = this._updateTags;
        const tag = options !== undefined ? options.tag : null;

        if (pendingWhiteboardState !== null && !pendingWhiteboardState.isEmpty()) {
            if (tag != null) {
                tags.add(tag);
            }

            commitPendingUpdates(this);
        }

        this._pendingWhiteboardState = whiteboardState;
        this._dirtyType = FULL_RECONCILE;
        this._dirtyElements.set('root', false);

        if (tag != null) {
            tags.add(tag);
        }

        commitPendingUpdates(this);
    }



    parseWhiteboardState(
        maybeStringifiedEditorState: string | SerializedWhiteboardState,
        updateFn?: () => void,
    ): WhiteboardState {
        const serializedEditorState =
            typeof maybeStringifiedEditorState === 'string'
                ? JSON.parse(maybeStringifiedEditorState)
                : maybeStringifiedEditorState;
        return parseWhiteboardState(serializedEditorState, this, updateFn);
    }

    update(updateFn: () => void, options?: WhiteboardUpdateOptions): void {
        updateWhiteboard(this, updateFn, options);
    }



    toJSON(): SerializedWhiteboard {
        return {
            whiteboardState: this._whiteboardState.toJSON(),
        };
    }
}
