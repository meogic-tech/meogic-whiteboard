<script lang="ts" setup>

import { useWhiteboard } from "../composables/useWhiteboard";
import { onMounted, onUnmounted } from "vue";
import {
  $getNodeByKey,
  COMMAND_PRIORITY_WHITEBOARD,
  COMPONENT_NODE_MOVING_COMMAND,
  WhiteboardNode
} from "@meogic/whiteboard";
import { $createBoundaryAuxiliaryLineNode, AuxiliaryLineNode } from "@meogic/whiteboard/src/nodes";
import { $getAuxiliaryLineContainerNode } from "@meogic/whiteboard/src/WhiteboardUtils";

const whiteboard = useWhiteboard()
let unregister: () => void

const gap = 5

onMounted(() => {
  unregister = whiteboard.registerCommand(COMPONENT_NODE_MOVING_COMMAND, ({nodeKey}) => {
    const node = $getNodeByKey(nodeKey)
    if (!node) {
      return false
    }
    const auxiliaryLineContainerNode = $getAuxiliaryLineContainerNode()
    if(!auxiliaryLineContainerNode){
      return false
    }
    const x = node.getLatest()._x
    const y = node.getLatest()._y
    const nodes = Array.from(whiteboard.getWhiteboardState()._nodeMap.values())
      .filter(n => n.getLatest()._x !== undefined)
      .filter(n => n.getKey() !== node.getKey())
    const sameXNodes = nodes.filter(n => Math.abs(n.getLatest()._x - x) < gap)
    console.log("sameXNodes", sameXNodes);
    if(sameXNodes.length > 0){
      let minYGap = Number.MAX_VALUE
      let minYGapNodes: WhiteboardNode[] = []
      for (let n of sameXNodes) {
        const gap = Math.abs(n.getLatest()._y - y)
        if(gap < minYGap){
          minYGapNodes = [n]
          minYGap = gap
        }
        if(gap === minYGap){
          minYGapNodes.push(n)
        }
      }
      for (let minYGapNode of minYGapNodes) {
        const newAuxiliaryLine = $createBoundaryAuxiliaryLineNode(
          node.getKey(),
          minYGapNode.getKey(),
          'left',
          'left'
        )
        auxiliaryLineContainerNode.append(newAuxiliaryLine)
      }
      console.log("minYGapNodes", minYGapNodes);
      if(minYGapNodes.length === 0){
        for (let child of auxiliaryLineContainerNode.getChildren()) {
          child.remove()
        }
      }else{
        node.getWritable()._x = minYGapNodes[0].getLatest()._x
      }
    }else{
      for (let child of auxiliaryLineContainerNode.getChildren()) {
        child.remove()
      }
    }
    return false
  }, COMMAND_PRIORITY_WHITEBOARD)
})

onUnmounted(() => {
  unregister()
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
