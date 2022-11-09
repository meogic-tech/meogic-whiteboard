import type { Component } from 'vue'
import { Teleport, computed, h, onMounted, onUnmounted, ref } from 'vue'
import {Whiteboard} from "@meogic/whiteboard";

export function useDecorators(whiteboard: Whiteboard) {
  const decorators = ref<Record<string, Component>>(whiteboard.getDecorators())

  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = whiteboard.registerDecoratorListener((nextDecorators) => {
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
      const element = whiteboard.getElementByKey(nodeKey)
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
