<script lang="ts" setup>
import {onMounted, onUnmounted} from "vue";
import {useTabManager} from "@meogic/tab-manager-vue";
import {CLICK_COMMAND, COMMAND_PRIORITY_LOW} from "@meogic/tab-manager";
import {ACTIVE_TAB_GROUP_COMMAND} from "@meogic/tab-manager";
import {$getNearestNodeTypeFromDOMNode} from "@meogic/tab-manager";
import {$isResizableTabGroupNode, ResizableTabGroupNode} from "@meogic/tab-manager-resizable";

const tabManager = useTabManager()
let unregisterListener: () => void

onMounted(() => {
  unregisterListener = tabManager.registerCommand(CLICK_COMMAND, (mouseEvent): boolean => {
    const node = $getNearestNodeTypeFromDOMNode(mouseEvent.target as Node, ResizableTabGroupNode)
    if(!node || !$isResizableTabGroupNode(node)){
      return false
    }
    tabManager.dispatchCommand(ACTIVE_TAB_GROUP_COMMAND, node.getKey())
    return false
  }, COMMAND_PRIORITY_LOW)
})

onUnmounted(() => {
  unregisterListener()
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
