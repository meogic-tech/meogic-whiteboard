import {WhiteboardCommand} from "./Whiteboard";
import {NodeKey} from "./WhiteboardNode";


export function createCommand<T>(): WhiteboardCommand<T> {
    return {};
}

export const CLICK_COMMAND: WhiteboardCommand<MouseEvent> = createCommand()

export const MOUSE_DOWN_COMMAND: WhiteboardCommand<MouseEvent> = createCommand();
export const MOUSE_MOVE_COMMAND: WhiteboardCommand<MouseEvent> = createCommand();
export const MOUSE_UP_COMMAND: WhiteboardCommand<MouseEvent> = createCommand();

export const KEY_BACKSPACE_COMMAND: WhiteboardCommand<KeyboardEvent> =
  createCommand();
export const KEY_DELETE_COMMAND: WhiteboardCommand<KeyboardEvent> =
  createCommand();
export const DELETE_CHARACTER_COMMAND: WhiteboardCommand<boolean> =
  createCommand();

export const DRAGSTART_COMMAND: WhiteboardCommand<DragEvent> = createCommand();
export const DRAGOVER_COMMAND: WhiteboardCommand<DragEvent> = createCommand();
export const DRAGEND_COMMAND: WhiteboardCommand<DragEvent> = createCommand();
export const DROP_COMMAND: WhiteboardCommand<DragEvent> = createCommand();
export const FOCUS_COMMAND: WhiteboardCommand<FocusEvent> = createCommand();
export const BLUR_COMMAND: WhiteboardCommand<FocusEvent> = createCommand();

export const CAN_REDO_COMMAND: WhiteboardCommand<boolean> = createCommand()
export const CAN_UNDO_COMMAND: WhiteboardCommand<boolean> = createCommand()
export const CLEAR_EDITOR_COMMAND: WhiteboardCommand<void> = createCommand()
export const CLEAR_HISTORY_COMMAND: WhiteboardCommand<void> = createCommand()
export const REDO_COMMAND: WhiteboardCommand<void> = createCommand()
export const UNDO_COMMAND: WhiteboardCommand<void> = createCommand()

export const CONTAINER_MOVE_COMMAND : WhiteboardCommand<{
    offsetX: number,
    offsetY: number,
}> = createCommand()

export const CONTAINER_ZOOM_COMMAND : WhiteboardCommand<{
    zoom: number,
}> = createCommand()

export const COMPONENT_NODE_MOVING_COMMAND: WhiteboardCommand<{
    nodeKey: NodeKey,
}> = createCommand()
