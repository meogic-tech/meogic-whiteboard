import {TabManager} from "./TabManager";


export function internalCreateSelection(
    editor: TabManager,
): string | null {
    const currentEditorState = editor.getTabManagerState();
    const lastSelectionKey = currentEditorState._selectionKey;

    return lastSelectionKey;
}
