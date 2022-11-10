<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import {
  $getNearestNodeFromDOMNode,
  $getNearestNodeTypeFromDOMNode, $getViewportNode, $isViewportNode, CONTAINER_MOVE_COMMAND,
  getActiveWhiteboard,
  MOUSE_DOWN_COMMAND,
  MOUSE_MOVE_COMMAND, MOUSE_UP_COMMAND, ViewportNode
} from "@meogic/whiteboard";
import { mergeRegister } from "@meogic/whiteboard-utils";
import { useWhiteboard } from "../composables/useWhiteboard";

const whiteboard = useWhiteboard()
let unregister: () => void
let isMouseDown = false
let startX = 0
let startY = 0
let startOffsetX = 0
let startOffsetY = 0
let lastTransition = 'none'

const onWheel = (event: WheelEvent) => {
  if(event.metaKey || event.ctrlKey){
    return
  }
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      return false
    }
    startOffsetX = viewportNode.getOffsetX()
    startOffsetY = viewportNode.getOffsetY()
    let deltaX = 0
    let deltaY = 0
    if(event.shiftKey){
      // @ts-ignore
      deltaX = event.wheelDeltaX > 0 ? 100 : -100
    }else{
      // @ts-ignore
      deltaY = event.wheelDeltaY > 0 ? 100 : -100
    }
    whiteboard.dispatchCommand(CONTAINER_MOVE_COMMAND, {
      offsetX: startOffsetX + deltaX,
      offsetY: startOffsetY + deltaY,
    })
  })
}


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
      const element = whiteboard.getElementByKey(viewportNode.getKey())
      if(element){
        lastTransition = element.style.transition
        element.style.transition = 'none'
      }
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
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      const element = whiteboard.getElementByKey(viewportNode.getKey())
      if(element){
        element.style.transition = lastTransition
        lastTransition = 'none'
      }
      return false
    }, 1),
  )
  whiteboard.getRootElement()?.addEventListener('wheel', onWheel)
})

onUnmounted(() => {
  unregister()
  whiteboard.getRootElement()?.removeEventListener('wheel', onWheel)
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
