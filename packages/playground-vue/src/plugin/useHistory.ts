import { TabManager } from '@meogic/tab-manager';
import { computed, Ref, watchEffect } from 'vue';

import { createEmptyHistoryState, HistoryState, registerHistory } from '../../../tab-manager-history/src';
import { getRealValue } from '../utils';


export function useHistory(
  tabManager: TabManager,
  externalHistoryState?: Ref<HistoryState> | HistoryState,
  delay?: Ref<number> | number,
) {
  const historyState = computed<HistoryState>(
    () => getRealValue(externalHistoryState) || createEmptyHistoryState(),
  )

  watchEffect((onInvalidate) => {
    const unregisterListener = registerHistory(tabManager, historyState.value, getRealValue(delay) || 1000)
    onInvalidate(() => {
      unregisterListener()
    })
  })
}
