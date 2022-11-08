<script lang="ts" setup>
import { useTabManager } from "@meogic/tab-manager-vue";
import { onMounted, onUnmounted } from "vue";
import { COMPONENT_NODE_MOVING_COMMAND } from "@meogic/tab-manager/src/TabManagerCommands";
import { $getNodeByKey, ShapeNode } from "@meogic/tab-manager";
import { $isLinkNode, LinkNode } from "@meogic/tab-manager/src/nodes/LinkNode";
import { getCenter } from "@meogic/tab-manager/src/TabManagerUtils";

const tabManager = useTabManager()
let unregister: () => void

onMounted(() => {
  unregister = tabManager.registerCommand(COMPONENT_NODE_MOVING_COMMAND, ({nodeKey}) => {
    const node = $getNodeByKey(nodeKey)
    if (!node) {
      return false
    }
    const linkNodes = Array.from(tabManager.getTabManagerState()._nodeMap.values())
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
