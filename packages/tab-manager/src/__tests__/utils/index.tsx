import {TabManagerState} from "../../TabManagerState";
import {createTabManager, Spread, TabManager, TabManagerConfig, TabManagerThemeClasses} from "../../TabManager";
import {WindowNode} from "../../nodes/WindowNode";
import {TabGroupNode} from "../../nodes/TabGroupNode";
import {ResizableTabGroupNode} from "@meogic/tab-manager-resizable/src";
import {TabGroupBarItemNode, TabGroupBarNode} from "@meogic/tab-manager-tab-group-bar/src";
import {SerializedTabNode, TabNode} from "@meogic/tab-manager";
import {SerializedUserTabNode} from "@meogic/tab-manager-playground-vue/src/nodes/UserTabNode";

const DEFAULT_NODES = [
    WindowNode,
    TabGroupNode,
    ResizableTabGroupNode,
    TabGroupBarNode,
    TabGroupBarItemNode,
    ]

export function createTestTabManager(
    config: {
        namespace?: string;
        editorState?: TabManagerState;
        theme?: TabManagerThemeClasses;
        parentEditor?: TabManager;
        nodes?: ReadonlyArray<typeof DEFAULT_NODES[number]>;
        onError?: (error: Error) => void;
        disableEvents?: boolean;
        readOnly?: boolean;
    } = {},
): TabManager {
    const customNodes = config.nodes || [];
    const editor = createTabManager({
        namespace: config.namespace,
        onError: (e) => {
            throw e;
        },
        ...config,
        nodes: DEFAULT_NODES.concat(customNodes),
    });
    return editor;
}

export type SerializedTestTabNode = Spread<
    {
        type: 'test_decorator';
        version: 1;
    },
    SerializedTabNode
    >;

export class TestTabNode extends TabNode<JSX.Element> {
    static getType(): string {
        return 'test-tab'
    }

    static clone(node: TestTabNode) {
        return new TestTabNode(node.__key)
    }

    static importJSON<T>(serializedNode: SerializedUserTabNode): TestTabNode {
        return $createTestTabNode();
    }

    exportJSON(): SerializedTestTabNode {
        return {
            name: '',
            active: false,
            type: 'test_decorator',
            version: 1,
        };
    }

    createDOM(config: TabManagerConfig): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(prevNode: TabNode<JSX.Element>, dom: HTMLElement): boolean {
        return false
    }

    isTopLevel(): boolean {
        return false
    }

    decorate(tabManager: TabManager, config: TabManagerConfig): JSX.Element {
        return <Decorator text={'Hello world'}/>;
    }
}

function Decorator({text}): JSX.Element {
    return <span>{text}</span>;
}


export function $createTestTabNode(): TestTabNode {
    return new TestTabNode();
}
