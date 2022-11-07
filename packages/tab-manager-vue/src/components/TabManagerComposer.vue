<script lang="ts" setup>
import {Klass, TabGroupNode, TabManager, TabManagerNode, TabManagerThemeClasses, $getRoot, TabNode, createTabManager} from "@meogic/tab-manager";
import {provide} from 'vue'
import {tabManagerKey} from "../composables/inject";

const HISTORY_MERGE_OPTIONS = {tag: 'history-merge'};


const props = defineProps<{
  initialConfig: {
    namespace?: string
    nodes?: Klass<TabManagerNode>[]
    tabNodes?: Klass<TabNode<unknown>>[]
    tabGroupNodes?: Klass<TabGroupNode>[]
    theme?: TabManagerThemeClasses
    tabManagerState?: ((tabManager: TabManager) => void)
  }
}>()
const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()
const {
  theme,
  namespace,
  nodes,
  tabNodes,
  tabGroupNodes,
  tabManagerState: initialTabManagerState,
} = props.initialConfig;
const tabManager = createTabManager({
  namespace,
  nodes,
  tabNodes,
  tabGroupNodes,
  onError: (error: Error) => emit('error', error),
  theme
})
if(initialTabManagerState){
  tabManager.update(() => {
    const root = $getRoot()
    if (root.isEmpty()){
      initialTabManagerState(tabManager)
    }
  }, HISTORY_MERGE_OPTIONS)
}

provide(tabManagerKey, tabManager)
</script>

<template>
  <slot/>
</template>

<style scoped lang="scss">

</style>
