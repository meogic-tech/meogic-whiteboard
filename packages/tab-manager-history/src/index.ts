/** @module @lexical/history */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  TabManagerState,
  TabManager,
} from '@meogic/tab-manager';

import {mergeRegister} from '@meogic/tab-manager-utils';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_TAB_MANAGER,
  REDO_COMMAND,
  UNDO_COMMAND,
} from '@meogic/tab-manager';
import { debounceExecLast } from "@meogic/tab-manager/src/TabManagerUtils";

type MergeAction = 0 | 1 | 2;
const HISTORY_MERGE = 0;
const HISTORY_PUSH = 1;
const DISCARD_HISTORY_CANDIDATE = 2;

type ChangeType = 0 | 1 | 2 | 3 | 4;
const OTHER = 0;

export type HistoryStateEntry = {
  tabManager: TabManager;
  tabManagerState: TabManagerState;
};
export type HistoryState = {
  current: null | HistoryStateEntry;
  redoStack: Array<HistoryStateEntry>;
  undoStack: Array<HistoryStateEntry>;
};

function getChangeType(
  prevTabManagerState: null | TabManagerState,
  nextTabManagerState: TabManagerState,
): ChangeType {
  if (
    prevTabManagerState === null
  ) {
    return OTHER;
  }

  return OTHER;
}


function createMergeActionGetter(
  tabManager: TabManager,
  delay: number,
): (
  prevTabManagerState: null | TabManagerState,
  nextTabManagerState: TabManagerState,
  currentHistoryEntry: null | HistoryStateEntry,
  tags: Set<string>,
) => MergeAction {
  let prevChangeTime = Date.now();
  let prevChangeType = OTHER;

  return (
    prevTabManagerState,
    nextTabManagerState,
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
      prevTabManagerState,
      nextTabManagerState,
    );

    const mergeAction = (() => {
      const isSameEditor =
        currentHistoryEntry === null || currentHistoryEntry.tabManager === tabManager;
      const shouldPushHistory = tags.has('history-push');
      const shouldMergeHistory =
        !shouldPushHistory && isSameEditor && tags.has('history-merge');

      if (shouldMergeHistory) {
        return HISTORY_MERGE;
      }

      if (prevTabManagerState === null) {
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

function redo(tabManager: TabManager, historyState: HistoryState): void {
  const redoStack = historyState.redoStack;
  const undoStack = historyState.undoStack;

  if (redoStack.length !== 0) {
    const current = historyState.current;

    if (current !== null) {
      undoStack.push(current);
      tabManager.dispatchCommand(CAN_UNDO_COMMAND, true);
    }

    const historyStateEntry = redoStack.pop();

    if (redoStack.length === 0) {
      tabManager.dispatchCommand(CAN_REDO_COMMAND, false);
    }

    historyState.current = historyStateEntry || null;

    if (historyStateEntry) {
      historyStateEntry.tabManager.setTabManagerState(historyStateEntry.tabManagerState, {
        tag: 'historic',
      });
    }
  }
}

function undo(tabManager: TabManager, historyState: HistoryState): void {
  const redoStack = historyState.redoStack;
  const undoStack = historyState.undoStack;
  const undoStackLength = undoStack.length;

  if (undoStackLength !== 0) {
    const current = historyState.current;
    const historyStateEntry = undoStack.pop();

    if (current !== null) {
      redoStack.push(current);
      tabManager.dispatchCommand(CAN_REDO_COMMAND, true);
    }

    if (undoStack.length === 0) {
      tabManager.dispatchCommand(CAN_UNDO_COMMAND, false);
    }

    historyState.current = historyStateEntry || null;

    if (historyStateEntry) {
      historyStateEntry.tabManager.setTabManagerState(
        historyStateEntry.tabManagerState.clone(),
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
  tabManager: TabManager,
  historyState: HistoryState,
  delay: number,
): () => void {
  const getMergeAction = createMergeActionGetter(tabManager, delay);

  const applyChange = ({
                         tabManagerState,
                         prevTabManagerState,
                         tags,
                       }: {
    tabManagerState: TabManagerState;
    prevTabManagerState: TabManagerState;

    tags: Set<string>;
  }): void => {
    const current = historyState.current;
    const redoStack = historyState.redoStack;
    const undoStack = historyState.undoStack;
    const currentTabManagerState = current === null ? null : current.tabManagerState;

    if (current !== null && tabManagerState === currentTabManagerState) {
      return;
    }

    const mergeAction = getMergeAction(
      prevTabManagerState,
      tabManagerState,
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
        tabManager.dispatchCommand(CAN_UNDO_COMMAND, true);
      }
    } else if (mergeAction === DISCARD_HISTORY_CANDIDATE) {
      return;
    }

    // Else we merge
    historyState.current = {
      tabManager,
      tabManagerState,
    };
  };
  // const debounced = debounceExecLast(applyChange, 20)
  const unregisterCommandListener = mergeRegister(
    tabManager.registerCommand(
      UNDO_COMMAND,
      () => {
        undo(tabManager, historyState);
        return true;
      },
      COMMAND_PRIORITY_TAB_MANAGER,
    ),
    tabManager.registerCommand(
      REDO_COMMAND,
      () => {
        redo(tabManager, historyState);
        return true;
      },
      COMMAND_PRIORITY_TAB_MANAGER,
    ),
    tabManager.registerCommand(
      CLEAR_EDITOR_COMMAND,
      () => {
        clearHistory(historyState);
        return false;
      },
      COMMAND_PRIORITY_TAB_MANAGER,
    ),
    tabManager.registerCommand(
      CLEAR_HISTORY_COMMAND,
      () => {
        clearHistory(historyState);
        tabManager.dispatchCommand(CAN_REDO_COMMAND, false);
        tabManager.dispatchCommand(CAN_UNDO_COMMAND, false);
        return true;
      },
      COMMAND_PRIORITY_TAB_MANAGER,
    ),
    tabManager.registerUpdateListener(applyChange),
  );

  const unregisterUpdateListener = tabManager.registerUpdateListener(applyChange);

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
