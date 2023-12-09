<script lang="ts" setup>
import {Klass, Whiteboard, WhiteboardNode, WhiteboardThemeClasses, $getRoot, createWhiteboard} from "@meogic/whiteboard";
import {provide} from 'vue'
import {whiteboardKey} from "../composables/inject";

const HISTORY_MERGE_OPTIONS = {tag: 'history-merge'};


const props = defineProps<{
  initialConfig: {
    namespace?: string
    nodes?: Klass<WhiteboardNode>[]
    theme?: WhiteboardThemeClasses
    readOnly?: boolean
    whiteboardState?: ((whiteboard: Whiteboard) => void)
  }
}>()
const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()
const {
  theme,
  namespace,
  nodes,
  readOnly,
  whiteboardState: initialWhiteboardState,
} = props.initialConfig;
const whiteboard = createWhiteboard({
  namespace,
  nodes,
  readOnly,
  onError: (error: Error) => emit('error', error),
  theme
})
if(initialWhiteboardState){
  whiteboard.update(() => {
    const root = $getRoot()
    if (root.isEmpty()){
      initialWhiteboardState(whiteboard)
    }
  }, {
    ...HISTORY_MERGE_OPTIONS,
    skipReadOnlyCheck: true,
  })
}

provide(whiteboardKey, whiteboard)
</script>

<template>
  <slot/>
</template>

<style scoped lang="scss">

</style>
