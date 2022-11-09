<script lang="ts" setup>
import { useWhiteboard } from "@meogic/whiteboard-vue";
import { onMounted, onUnmounted } from "vue";
import { $getNodeByKey, $isLinkNode, COMPONENT_NODE_MOVING_COMMAND, ShapeNode } from "@meogic/whiteboard";

const whiteboard = useWhiteboard()
let unregister: () => void

onMounted(() => {
  unregister = whiteboard.registerCommand(COMPONENT_NODE_MOVING_COMMAND, ({nodeKey}) => {
    const node = $getNodeByKey(nodeKey)
    if (!node) {
      return false
    }
    const linkNodes = Array.from(whiteboard.getWhiteboardState()._nodeMap.values())
      .filter((n) => $isLinkNode(n))
      .filter((n) => n._sourceKey === nodeKey || n._targetKey === nodeKey) as LinkNode[]
    for (const linkNode of linkNodes) {
      linkNode.$setNewPosition()
    }
    return false
  }, 1)
})

onUnmounted(() => {
  unregister()
})



</script>

<template>
</template>

<style scoped lang="scss">

</style>
