<script lang="ts" setup>
import { useWhiteboard } from "@meogic/whiteboard-vue";
import { onMounted, onUnmounted } from "vue";
import {
  $getNearestNodeFromDOMNode,
  $getNearestNodeTypeFromDOMNode, $getViewportNode, $isViewportNode, CONTAINER_MOVE_COMMAND,
  getActiveWhiteboard,
  MOUSE_DOWN_COMMAND,
  MOUSE_MOVE_COMMAND, MOUSE_UP_COMMAND, ViewportNode
} from "@meogic/whiteboard";
import { mergeRegister } from "@meogic/whiteboard-utils";

const whiteboard = useWhiteboard()
let unregister: () => void
let isMouseDown = false
let startX = 0
let startY = 0
let startOffsetX = 0
let startOffsetY = 0


onMounted(() => {
  unregister = mergeRegister(
    whiteboard.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      isMouseDown = true
      startX = mouseEvent.x
      startY = mouseEvent.y
      startOffsetX = viewportNode.getOffsetX()
      startOffsetY = viewportNode.getOffsetY()
      return false
    }, 1),
    whiteboard.registerCommand(MOUSE_MOVE_COMMAND, (mouseEvent: MouseEvent) => {
      mouseEvent.preventDefault()
      if(!isMouseDown){
        return false
      }
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      const deltaX = mouseEvent.x - startX
      const deltaY = mouseEvent.y - startY
      whiteboard.dispatchCommand(CONTAINER_MOVE_COMMAND, {
        offsetX: startOffsetX + deltaX,
        offsetY: startOffsetY + deltaY,
      })
      return false
    }, 1),
    whiteboard.registerCommand(MOUSE_UP_COMMAND, (mouseEvent: MouseEvent) => {
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
