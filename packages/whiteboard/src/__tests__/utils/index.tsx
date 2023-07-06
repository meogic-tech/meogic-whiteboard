import {WhiteboardState} from "../../WhiteboardState";
import {createWhiteboard, Whiteboard, WhiteboardThemeClasses} from "../../Whiteboard";

const DEFAULT_NODES = [
    ]

export function createTestWhiteboard(
    config: {
        namespace?: string;
        editorState?: WhiteboardState;
        theme?: WhiteboardThemeClasses;
        parentEditor?: Whiteboard;
        nodes?: ReadonlyArray<typeof DEFAULT_NODES[number]>;
        onError?: (error: Error) => void;
        disableEvents?: boolean;
        readOnly?: boolean;
    } = {},
): Whiteboard {
    const customNodes = config.nodes || [];
    const editor = createWhiteboard({
        namespace: config.namespace,
        onError: (e) => {
            throw e;
        },
        ...config,
        nodes: DEFAULT_NODES.concat(customNodes),
    });
    return editor;
}


