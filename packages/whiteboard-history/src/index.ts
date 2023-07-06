/** @module @lexical/history */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  WhiteboardState,
  Whiteboard,
} from '@meogic/whiteboard';

import {mergeRegister} from '@meogic/whiteboard-utils';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_WHITEBOARD,
  REDO_COMMAND,
  UNDO_COMMAND,
} from '@meogic/whiteboard';
import {UpdateTagType} from "@meogic/whiteboard/src/WhiteboardUpdates";

type MergeAction = 0 | 1 | 2;
const HISTORY_MERGE = 0;
const HISTORY_PUSH = 1;
const DISCARD_HISTORY_CANDIDATE = 2;

type ChangeType = 0 | 1 | 2 | 3 | 4;
const OTHER = 0;

export type HistoryStateEntry = {
  whiteboard: Whiteboard;
  whiteboardState: WhiteboardState;
};
export type HistoryState = {
  current: null | HistoryStateEntry;
  redoStack: Array<HistoryStateEntry>;
  undoStack: Array<HistoryStateEntry>;
};

function getChangeType(
  prevWhiteboardState: null | WhiteboardState,
  nextWhiteboardState: WhiteboardState,
): ChangeType {
  if (
    prevWhiteboardState === null
  ) {
    return OTHER;
  }

  return OTHER;
}


function createMergeActionGetter(
  whiteboard: Whiteboard,
  delay: number,
): (
  prevWhiteboardState: null | WhiteboardState,
  nextWhiteboardState: WhiteboardState,
  currentHistoryEntry: null | HistoryStateEntry,
  tags: Set<UpdateTagType>,
) => MergeAction {
  let prevChangeTime = Date.now();
  let prevChangeType = OTHER;

  return (
    prevWhiteboardState,
    nextWhiteboardState,
    currentHistoryEntry,
    tags,
  ) => {
    const changeTime = Date.now();

    // If applying changes from history stack there's no need
    // to run history logic again, as history entries already calculated
    if (tags.has('historic')) {
      prevChangeType = OTHER;
      prevChangeTime = changeTime;
      return DISCARD_HISTORY_CANDIDATE;
    }

    const changeType = getChangeType(
      prevWhiteboardState,
      nextWhiteboardState,
    );

    const mergeAction = (() => {
      const isSameEditor =
        currentHistoryEntry === null || currentHistoryEntry.whiteboard === whiteboard;
      const shouldPushHistory = tags.has('history-push');
      const shouldMergeHistory =
        !shouldPushHistory && isSameEditor && tags.has('history-merge');

      if (shouldMergeHistory) {
        return HISTORY_MERGE;
      }

      if (prevWhiteboardState === null) {
        return HISTORY_PUSH;
      }

      if (
        shouldPushHistory === false &&
        changeType !== OTHER &&
        changeType === prevChangeType &&
        changeTime < prevChangeTime + delay &&
        isSameEditor
      ) {
        return HISTORY_MERGE;
      }

      // A single node might have been marked as dirty, but not have changed
      // due to some node transform reverting the change.

      return HISTORY_PUSH;
    })();

    prevChangeTime = changeTime;
    prevChangeType = changeType;

    return mergeAction;
  };
}

function redo(whiteboard: Whiteboard, historyState: HistoryState): void {
  const redoStack = historyState.redoStack;
  const undoStack = historyState.undoStack;

  if (redoStack.length !== 0) {
    const current = historyState.current;

    if (current !== null) {
      undoStack.push(current);
      whiteboard.dispatchCommand(CAN_UNDO_COMMAND, true);
    }

    const historyStateEntry = redoStack.pop();

    if (redoStack.length === 0) {
      whiteboard.dispatchCommand(CAN_REDO_COMMAND, false);
    }

    historyState.current = historyStateEntry || null;

    if (historyStateEntry) {
      historyStateEntry.whiteboard.setWhiteboardState(historyStateEntry.whiteboardState, {
        tag: 'historic',
      });
    }
  }
}

function undo(whiteboard: Whiteboard, historyState: HistoryState): void {
  const redoStack = historyState.redoStack;
  const undoStack = historyState.undoStack;
  const undoStackLength = undoStack.length;

  if (undoStackLength !== 0) {
    const current = historyState.current;
    const historyStateEntry = undoStack.pop();

    if (current !== null) {
      redoStack.push(current);
      whiteboard.dispatchCommand(CAN_REDO_COMMAND, true);
    }

    if (undoStack.length === 0) {
      whiteboard.dispatchCommand(CAN_UNDO_COMMAND, false);
    }

    historyState.current = historyStateEntry || null;

    if (historyStateEntry) {
      historyStateEntry.whiteboard.setWhiteboardState(
        historyStateEntry.whiteboardState.clone(),
        {
          tag: 'historic',
        },
      );
    }
  }
}

function clearHistory(historyState: HistoryState) {
  historyState.undoStack = [];
  historyState.redoStack = [];
  historyState.current = null;
}

export function registerHistory(
  whiteboard: Whiteboard,
  historyState: HistoryState,
  delay: number,
): () => void {
  const getMergeAction = createMergeActionGetter(whiteboard, delay);

  const applyChange = ({
                         whiteboardState,
                         prevWhiteboardState,
                         tags,
                       }: {
    whiteboardState: WhiteboardState;
    prevWhiteboardState: WhiteboardState;

    tags: Set<UpdateTagType>;
  }): void => {
    if (!tags.has('add-history') && !tags.has('history-merge')) {
      return;
    }
    const current = historyState.current;
    const redoStack = historyState.redoStack;
    const undoStack = historyState.undoStack;
    const currentWhiteboardState = current === null ? null : current.whiteboardState;

    if (current !== null && whiteboardState === currentWhiteboardState) {
      return;
    }

    const mergeAction = getMergeAction(
      prevWhiteboardState,
      whiteboardState,
      current,
      tags,
    );

    if (mergeAction === HISTORY_PUSH) {
      if (redoStack.length !== 0) {
        historyState.redoStack = [];
      }

      if (current !== null) {
        undoStack.push({
          ...current,
        });
        whiteboard.dispatchCommand(CAN_UNDO_COMMAND, true);
      }
    } else if (mergeAction === DISCARD_HISTORY_CANDIDATE) {
      return;
    }

    // Else we merge
    historyState.current = {
      whiteboard,
      whiteboardState,
    };
  };
  // const debounced = debounceExecLast(applyChange, 20)
  const unregisterCommandListener = mergeRegister(
    whiteboard.registerCommand(
      UNDO_COMMAND,
      () => {
        undo(whiteboard, historyState);
        return true;
      },
      COMMAND_PRIORITY_WHITEBOARD,
    ),
    whiteboard.registerCommand(
      REDO_COMMAND,
      () => {
        redo(whiteboard, historyState);
        return true;
      },
      COMMAND_PRIORITY_WHITEBOARD,
    ),
    whiteboard.registerCommand(
      CLEAR_EDITOR_COMMAND,
      () => {
        clearHistory(historyState);
        return false;
      },
      COMMAND_PRIORITY_WHITEBOARD,
    ),
    whiteboard.registerCommand(
      CLEAR_HISTORY_COMMAND,
      () => {
        clearHistory(historyState);
        whiteboard.dispatchCommand(CAN_REDO_COMMAND, false);
        whiteboard.dispatchCommand(CAN_UNDO_COMMAND, false);
        return true;
      },
      COMMAND_PRIORITY_WHITEBOARD,
    ),
    whiteboard.registerUpdateListener(applyChange),
  );

  const unregisterUpdateListener = whiteboard.registerUpdateListener(applyChange);

  return () => {
    unregisterCommandListener();
    unregisterUpdateListener();
  };
}

export function createEmptyHistoryState(): HistoryState {
  return {
    current: null,
    redoStack: [],
    undoStack: [],
  };
}
