import type { Component } from 'vue'
import { Teleport, computed, h, onMounted, onUnmounted, ref } from 'vue'
import {TabManager} from "@meogic/tab-manager";

export function useDecorators(tabManager: TabManager) {
  const decorators = ref<Record<string, Component>>(tabManager.getDecorators())

  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = tabManager.registerDecoratorListener((nextDecorators) => {
      // @ts-ignore
      decorators.value = nextDecorators
    })
  })

  onUnmounted(() => {
    unregisterListener?.()
  })

  // Return decorators defined as Vue Teleports
  return computed(() => {
    const decoratedTeleports = []
    const decoratorKeys = Object.keys(decorators.value)
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i]
      const vueDecorator = decorators.value[nodeKey]
      const element = tabManager.getElementByKey(nodeKey)
      if (element !== null) {
        decoratedTeleports.push(
          // @ts-expect-error: Incompatible types
          h(Teleport, {
            to: element,
          }, [vueDecorator]),
        )
      }
    }

    return decoratedTeleports
  })
}
