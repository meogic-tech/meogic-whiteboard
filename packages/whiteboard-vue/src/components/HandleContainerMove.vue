<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
import { $isBackgroundNode, $isViewportNode, CONTAINER_MOVE_COMMAND, ViewportNode } from "@meogic/whiteboard";
import { mergeRegister } from "@meogic/whiteboard-utils";
import { useWhiteboard } from "../composables/useWhiteboard";


const whiteboard = useWhiteboard()

const $getViewportNode = (): ViewportNode | undefined => {
  return Array.from(whiteboard.getWhiteboardState()._nodeMap.values()).filter((n) => $isViewportNode(n))[0] as ViewportNode | undefined
}

const $getBackgroundNode = (): ViewportNode | undefined => {
  return Array.from(whiteboard.getWhiteboardState()._nodeMap.values()).filter((n) => $isBackgroundNode(n))[0] as ViewportNode | undefined
}

let unregister: () => void
onMounted(() => {
  unregister = mergeRegister(
    whiteboard.registerCommand(CONTAINER_MOVE_COMMAND, ({offsetX, offsetY}) => {
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
