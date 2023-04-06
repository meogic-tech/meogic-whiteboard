import {Whiteboard} from "./Whiteboard";
import {
    dispatchCommand,
    isBackspace,
    isDelete,
    isDeleteBackward,
    isDeleteForward,
    isRedo,
    isUndo
} from "./WhiteboardUtils";
import {
    BLUR_COMMAND,
    CLICK_COMMAND, COPY_COMMAND, CUT_COMMAND, DELETE_CHARACTER_COMMAND,
    DRAGEND_COMMAND,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    FOCUS_COMMAND, KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    MOUSE_DOWN_COMMAND,
    MOUSE_MOVE_COMMAND,
    MOUSE_UP_COMMAND, PASTE_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND
} from "./WhiteboardCommands";

let lastKeyDownTimeStamp = 0;
let lastKeyCode = 0;
let rootElementsRegistered = 0;
let isSelectionChangeFromDOMUpdate = false;
let isInsertLineBreak = false;
let isFirefoxEndingComposition = false;

type RootElementRemoveHandles = Array<() => void>;
type RootElementEvents = Array<
    [
        string,
            Record<string, unknown> | ((event: Event, whiteboard: Whiteboard) => void),
    ]
    >;

// TODO freeze是什么
const PASS_THROUGH_COMMAND = Object.freeze({});

const rootElementEvents: RootElementEvents = [
    ['keydown', onKeyDown],
    ['cut', PASS_THROUGH_COMMAND],
    ['copy', PASS_THROUGH_COMMAND],
    ['paste', PASS_THROUGH_COMMAND],
    ['click', PASS_THROUGH_COMMAND],
    ['mousedown', PASS_THROUGH_COMMAND],
    ['mousemove', PASS_THROUGH_COMMAND],
    ['mouseup', PASS_THROUGH_COMMAND],
    ['dragstart', PASS_THROUGH_COMMAND],
    ['dragover', PASS_THROUGH_COMMAND],
    ['dragend', PASS_THROUGH_COMMAND],
    ['focus', PASS_THROUGH_COMMAND],
    ['blur', PASS_THROUGH_COMMAND],
    ['drop', PASS_THROUGH_COMMAND],
];

function hasStoppedWhiteboardPropagation(event: Event): boolean {
    // @ts-ignore
    const stopped = event._whiteboardHandled === true;
    return stopped;
}

function stopWhiteboardPropagation(event: Event): void {
    // We attach a special property to ensure the same event doesn't re-fire
    // for parent editors.
    // @ts-ignore
    event._whiteboardHandled = true;
}

function onKeyDown(event: KeyboardEvent, whiteboard: Whiteboard): void {
    if (hasStoppedWhiteboardPropagation(event)) {
        return;
    }
    stopWhiteboardPropagation(event);
    lastKeyDownTimeStamp = event.timeStamp;
    lastKeyCode = event.keyCode;
    const {keyCode, shiftKey, ctrlKey, metaKey, altKey} = event;
    if(isUndo(keyCode, shiftKey, metaKey, ctrlKey)){
        event.preventDefault();
        dispatchCommand(whiteboard, UNDO_COMMAND, undefined);
    }else if(isRedo(keyCode, shiftKey, metaKey, ctrlKey)){
        event.preventDefault();
        dispatchCommand(whiteboard, REDO_COMMAND, undefined);
    }else if(isDeleteBackward(keyCode, shiftKey, metaKey, ctrlKey)){
        if (isBackspace(keyCode)) {
            dispatchCommand(whiteboard, KEY_BACKSPACE_COMMAND, event);
        } else {
            event.preventDefault();
            dispatchCommand(whiteboard, DELETE_CHARACTER_COMMAND, true);
        }
    }else if (isDeleteForward(keyCode, ctrlKey, shiftKey, altKey, metaKey)) {
        if (isDelete(keyCode)) {
            dispatchCommand(whiteboard, KEY_DELETE_COMMAND, event);
        } else {
            event.preventDefault();
            dispatchCommand(whiteboard, DELETE_CHARACTER_COMMAND, false);
        }
    }

}

function getRootElementRemoveHandles(
    rootElement: HTMLElement,
): RootElementRemoveHandles {
    // @ts-expect-error: internal field
    let eventHandles = rootElement.__whiteboardEventHandles;

    if (eventHandles === undefined) {
        eventHandles = [];
        // @ts-expect-error: internal field
        rootElement.__whiteboardEventHandles = eventHandles;
    }

    return eventHandles;
}

export function addRootElementEvents(
    rootElement: HTMLElement,
    whiteboard: Whiteboard,
): void {
    rootElementsRegistered++;
    // @ts-expect-error: internal field
    rootElement.__whiteboard = whiteboard;
    const removeHandles = getRootElementRemoveHandles(rootElement);

    for (let i = 0; i < rootElementEvents.length; i++) {
        const [eventName, onEvent] = rootElementEvents[i];
        const eventHandler =
            typeof onEvent === 'function'
                ? (event: Event) => {
                    onEvent(event, whiteboard);
                }
                : (event: Event) => {
                    switch (eventName) {
                        case 'cut':
                            return dispatchCommand(
                              whiteboard,
                              CUT_COMMAND,
                              event as ClipboardEvent,
                            );

                        case 'copy':
                            return dispatchCommand(
                              whiteboard,
                              COPY_COMMAND,
                              event as ClipboardEvent,
                            );

                        case 'paste':
                            return dispatchCommand(
                              whiteboard,
                              PASTE_COMMAND,
                              event as ClipboardEvent,
                            );
                        case 'click':
                            return dispatchCommand(
                                whiteboard,
                                CLICK_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mousedown':
                            return dispatchCommand(
                                whiteboard,
                                MOUSE_DOWN_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mousemove':
                            return dispatchCommand(
                                whiteboard,
                                MOUSE_MOVE_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mouseup':
                            return dispatchCommand(
                                whiteboard,
                                MOUSE_UP_COMMAND,
                                event as MouseEvent,
                            );
                        case 'dragstart':
                            return dispatchCommand(
                                whiteboard,
                                DRAGSTART_COMMAND,
                                event as DragEvent,
                            );

                        case 'dragover':
                            return dispatchCommand(
                                whiteboard,
                                DRAGOVER_COMMAND,
                                event as DragEvent,
                            );

                        case 'dragend':
                            return dispatchCommand(
                                whiteboard,
                                DRAGEND_COMMAND,
                                event as DragEvent,
                            );

                        case 'focus':
                            return dispatchCommand(
                                whiteboard,
                                FOCUS_COMMAND,
                                event as FocusEvent,
                            );

                        case 'blur':
                            return dispatchCommand(
                                whiteboard,
                                BLUR_COMMAND,
                                event as FocusEvent,
                            );

                        case 'drop':
                            return dispatchCommand(
                                whiteboard,
                                DROP_COMMAND,
                                event as DragEvent,
                            );
                        }
                };
        rootElement.addEventListener(eventName, eventHandler);
        removeHandles.push(() => {
            rootElement.removeEventListener(eventName, eventHandler);
        });
    }
}

export function removeRootElementEvents(rootElement: HTMLElement): void {
    if (rootElementsRegistered !== 0) {
        rootElementsRegistered--;

    }

    // @ts-expect-error: internal field
    const whiteboard: Whiteboard | null | undefined = rootElement.__whiteboard;

    const removeHandles = getRootElementRemoveHandles(rootElement);

    for (let i = 0; i < removeHandles.length; i++) {
        removeHandles[i]();
    }

    // @ts-expect-error: internal field
    rootElement.__whiteboardEventHandles = [];
}
