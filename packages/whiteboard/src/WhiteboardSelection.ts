import {Whiteboard} from "./Whiteboard";


export function internalCreateSelection(
    editor: Whiteboard,
): string | null {
    const currentEditorState = editor.getWhiteboardState();
    const lastSelectionKey = currentEditorState._selectionKey;

    return lastSelectionKey;
}
