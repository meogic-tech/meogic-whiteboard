import {TabManagerCommand} from "./TabManager";
import {NodeKey} from "./TabManagerNode";


export function createCommand<T>(): TabManagerCommand<T> {
    return {};
}

export const CLICK_COMMAND: TabManagerCommand<MouseEvent> = createCommand()

export const MOUSE_DOWN_COMMAND: TabManagerCommand<MouseEvent> = createCommand();
export const MOUSE_MOVE_COMMAND: TabManagerCommand<MouseEvent> = createCommand();
export const MOUSE_UP_COMMAND: TabManagerCommand<MouseEvent> = createCommand();

export const DRAGSTART_COMMAND: TabManagerCommand<DragEvent> = createCommand();
export const DRAGOVER_COMMAND: TabManagerCommand<DragEvent> = createCommand();
export const DRAGEND_COMMAND: TabManagerCommand<DragEvent> = createCommand();
export const DROP_COMMAND: TabManagerCommand<DragEvent> = createCommand();
export const FOCUS_COMMAND: TabManagerCommand<FocusEvent> = createCommand();
export const BLUR_COMMAND: TabManagerCommand<FocusEvent> = createCommand();

export const CLOSE_TAB_COMMAND: TabManagerCommand<NodeKey> = createCommand();
export const ADD_TAB_COMMAND: TabManagerCommand<{
    parentTabGroupNodeKey: NodeKey,
    name: string | undefined
}> = createCommand();
export const ACTIVE_TAB_COMMAND: TabManagerCommand<{
    tabNodeKey: NodeKey
}> = createCommand();
export const ACTIVE_TAB_GROUP_COMMAND: TabManagerCommand<NodeKey> = createCommand();

export const DRAGGING_RESIZE_HANDLE_HORIZONTALLY_COMMAND: TabManagerCommand<{
    moveMouseEvent: MouseEvent,
    downMouseEvent: MouseEvent,
    percent: number,
    nodeKey: NodeKey
}> = createCommand()

export const CONTAINER_MOVE_COMMAND : TabManagerCommand<{
    offsetX: number,
    offsetY: number,
}> = createCommand()

export const CONTAINER_ZOOM_COMMAND : TabManagerCommand<{
    zoom: number,
}> = createCommand()
