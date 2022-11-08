import getDOMSelection from "shared/src/getDOMSelection";
import {TabManager} from "./TabManager";
import { dispatchCommand, isRedo, isUndo } from "./TabManagerUtils";
import {
    BLUR_COMMAND, CLICK_COMMAND,
    DRAGEND_COMMAND,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    FOCUS_COMMAND, MOUSE_DOWN_COMMAND, MOUSE_MOVE_COMMAND, MOUSE_UP_COMMAND, REDO_COMMAND, UNDO_COMMAND
} from "./TabManagerCommands";

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
            Record<string, unknown> | ((event: Event, tabManager: TabManager) => void),
    ]
    >;

// TODO freeze是什么
const PASS_THROUGH_COMMAND = Object.freeze({});

const rootElementEvents: RootElementEvents = [
    ['keydown', onKeyDown],
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

function hasStoppedTabManagerPropagation(event: Event): boolean {
    // @ts-ignore
    const stopped = event._tabManagerHandled === true;
    return stopped;
}

function stopTabManagerPropagation(event: Event): void {
    // We attach a special property to ensure the same event doesn't re-fire
    // for parent editors.
    // @ts-ignore
    event._tabManagerHandled = true;
}

function onKeyDown(event: KeyboardEvent, tabManager: TabManager): void {
    if (hasStoppedTabManagerPropagation(event)) {
        return;
    }
    stopTabManagerPropagation(event);
    lastKeyDownTimeStamp = event.timeStamp;
    lastKeyCode = event.keyCode;
    const {keyCode, shiftKey, ctrlKey, metaKey, altKey} = event;
    console.log('keydown');
    if(isUndo(keyCode, shiftKey, metaKey, ctrlKey)){
        event.preventDefault();
        console.log('undo');
        dispatchCommand(tabManager, UNDO_COMMAND, undefined);
    }else if(isRedo(keyCode, shiftKey, metaKey, ctrlKey)){
        event.preventDefault();
        dispatchCommand(tabManager, REDO_COMMAND, undefined);
    }

}

function getRootElementRemoveHandles(
    rootElement: HTMLElement,
): RootElementRemoveHandles {
    // @ts-expect-error: internal field
    let eventHandles = rootElement.__tabManagerEventHandles;

    if (eventHandles === undefined) {
        eventHandles = [];
        // @ts-expect-error: internal field
        rootElement.__tabManagerEventHandles = eventHandles;
    }

    return eventHandles;
}

export function addRootElementEvents(
    rootElement: HTMLElement,
    tabManager: TabManager,
): void {
    rootElementsRegistered++;
    // @ts-expect-error: internal field
    rootElement.__tabManager = tabManager;
    const removeHandles = getRootElementRemoveHandles(rootElement);

    for (let i = 0; i < rootElementEvents.length; i++) {
        const [eventName, onEvent] = rootElementEvents[i];
        const eventHandler =
            typeof onEvent === 'function'
                ? (event: Event) => {
                    onEvent(event, tabManager);
                }
                : (event: Event) => {
                    switch (eventName) {
                        case 'click':
                            return dispatchCommand(
                                tabManager,
                                CLICK_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mousedown':
                            return dispatchCommand(
                                tabManager,
                                MOUSE_DOWN_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mousemove':
                            return dispatchCommand(
                                tabManager,
                                MOUSE_MOVE_COMMAND,
                                event as MouseEvent,
                            );
                        case 'mouseup':
                            return dispatchCommand(
                                tabManager,
                                MOUSE_UP_COMMAND,
                                event as MouseEvent,
                            );
                        case 'dragstart':
                            return dispatchCommand(
                                tabManager,
                                DRAGSTART_COMMAND,
                                event as DragEvent,
                            );

                        case 'dragover':
                            return dispatchCommand(
                                tabManager,
                                DRAGOVER_COMMAND,
                                event as DragEvent,
                            );

                        case 'dragend':
                            return dispatchCommand(
                                tabManager,
                                DRAGEND_COMMAND,
                                event as DragEvent,
                            );

                        case 'focus':
                            return dispatchCommand(
                                tabManager,
                                FOCUS_COMMAND,
                                event as FocusEvent,
                            );

                        case 'blur':
                            return dispatchCommand(
                                tabManager,
                                BLUR_COMMAND,
                                event as FocusEvent,
                            );

                        case 'drop':
                            return dispatchCommand(
                                tabManager,
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
    const tabManager: TabManager | null | undefined = rootElement.__tabManager;

    const removeHandles = getRootElementRemoveHandles(rootElement);

    for (let i = 0; i < removeHandles.length; i++) {
        removeHandles[i]();
    }

    // @ts-expect-error: internal field
    rootElement.__tabManagerEventHandles = [];
}
