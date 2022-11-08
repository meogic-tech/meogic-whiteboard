<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import { useTabManager } from "@meogic/tab-manager-vue";
import { CONTAINER_MOVE_COMMAND } from "@meogic/tab-manager/src/TabManagerCommands";
import { $isBackgroundNode, $isViewportNode, ViewportNode } from "@meogic/tab-manager";
import { mergeRegister } from "@meogic/tab-manager-utils";


const tabManager = useTabManager()

const $getViewportNode = (): ViewportNode | undefined => {
  return Array.from(tabManager.getTabManagerState()._nodeMap.values()).filter((n) => $isViewportNode(n))[0] as ViewportNode | undefined
}

const $getBackgroundNode = (): ViewportNode | undefined => {
  return Array.from(tabManager.getTabManagerState()._nodeMap.values()).filter((n) => $isBackgroundNode(n))[0] as ViewportNode | undefined
}

let unregister: () => void
onMounted(() => {
  unregister = mergeRegister(
    tabManager.registerCommand(CONTAINER_MOVE_COMMAND, ({offsetX, offsetY}) => {
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      viewportNode.getWritable()._offsetX = offsetX
      viewportNode.getWritable()._offsetY = offsetY

      const backgroundNode = $getBackgroundNode()
      if(!backgroundNode){
        return false
      }
      backgroundNode.getWritable()._offsetX = offsetX
      backgroundNode.getWritable()._offsetY = offsetY


      return false
    }, 0)
  )
})

onUnmounted(() => {
  unregister()
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
