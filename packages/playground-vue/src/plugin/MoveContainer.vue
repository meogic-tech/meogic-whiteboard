<script lang="ts" setup>
import { useTabManager } from "@meogic/tab-manager-vue";
import { onMounted, onUnmounted } from "vue";
import {
  $getNearestNodeFromDOMNode,
  $getNearestNodeTypeFromDOMNode, $isViewportNode,
  getActiveTabManager,
  MOUSE_DOWN_COMMAND,
  MOUSE_MOVE_COMMAND, MOUSE_UP_COMMAND, ViewportNode
} from "@meogic/tab-manager";
import { mergeRegister } from "@meogic/tab-manager-utils";
import { CONTAINER_MOVE_COMMAND } from "@meogic/tab-manager/src/TabManagerCommands";

const tabManager = useTabManager()
let unregister: () => void
let isMouseDown = false
let startX = 0
let startY = 0
let startOffsetX = 0
let startOffsetY = 0

const $getViewportNode = (): ViewportNode | undefined => {
  return Array.from(tabManager.getTabManagerState()._nodeMap.values()).filter((n) => $isViewportNode(n))[0] as ViewportNode | undefined
}

onMounted(() => {
  unregister = mergeRegister(
    tabManager.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      console.log("viewportNode", viewportNode);
      isMouseDown = true
      startX = mouseEvent.x
      startY = mouseEvent.y
      startOffsetX = viewportNode.getOffsetX()
      startOffsetY = viewportNode.getOffsetY()
      return false
    }, 1),
    tabManager.registerCommand(MOUSE_MOVE_COMMAND, (mouseEvent: MouseEvent) => {
      if(!isMouseDown){
        return false
      }
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      const deltaX = mouseEvent.x - startX
      const deltaY = mouseEvent.y - startY
      tabManager.dispatchCommand(CONTAINER_MOVE_COMMAND, {
        offsetX: startOffsetX + deltaX,
        offsetY: startOffsetY + deltaY,
      })
      return false
    }, 1),
    tabManager.registerCommand(MOUSE_UP_COMMAND, (mouseEvent: MouseEvent) => {
      isMouseDown = false
      return false
    }, 1),
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
