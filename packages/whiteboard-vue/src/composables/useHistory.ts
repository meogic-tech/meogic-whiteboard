import { Whiteboard } from '@meogic/whiteboard';
import { computed, Ref, watchEffect } from 'vue';

import { createEmptyHistoryState, HistoryState, registerHistory } from '@meogic/whiteboard-history';
import { getRealValue } from '@meogic/whiteboard-playground-vue/src/utils';


export function useHistory(
  whiteboard: Whiteboard,
  externalHistoryState?: Ref<HistoryState> | HistoryState,
  delay?: Ref<number> | number,
) {
  const historyState = computed<HistoryState>(
    () => getRealValue(externalHistoryState) || createEmptyHistoryState(),
  )

  watchEffect((onInvalidate) => {
    const unregisterListener = registerHistory(whiteboard, historyState.value, getRealValue(delay) || 1000)
    onInvalidate(() => {
      unregisterListener()
    })
  })
}
