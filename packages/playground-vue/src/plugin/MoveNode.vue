<script lang="ts" setup>
import { useTabManager } from "@meogic/tab-manager-vue";
import { onMounted, onUnmounted } from "vue";
import {
  $getNearestNodeTypeFromDOMNode,
  MOUSE_DOWN_COMMAND,
  MOUSE_MOVE_COMMAND,
  MOUSE_UP_COMMAND,
  ShapeNode
} from "@meogic/tab-manager";
import { mergeRegister } from "@meogic/tab-manager-utils";
import { $getViewportNode } from "@meogic/tab-manager/src/TabManagerUtils";
import { COMPONENT_NODE_MOVING_COMMAND, CONTAINER_MOVE_COMMAND } from "@meogic/tab-manager/src/TabManagerCommands";
const tabManager = useTabManager()
let unregister: () => void
let isMouseDown = false
let startX = 0
let startY = 0
let startOffsetX = 0
let startOffsetY = 0
let movingNode: ShapeNode | undefined


onMounted(() => {
  unregister = mergeRegister(
    tabManager.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
      const node = $getNearestNodeTypeFromDOMNode(mouseEvent.target as HTMLElement, ShapeNode) as ShapeNode
      if(!node){
        return false
      }
      const parent = node.getParent()
      if(!parent){
        return false
      }
      if(parent.getLastChild() !== node){
        // 当node不是最后一个的时候
        node.remove()
        parent?.append(node)
      }
      movingNode = node
      isMouseDown = true
      startX = mouseEvent.x
      startY = mouseEvent.y
      startOffsetX = node.getX()
      startOffsetY = node.getY()

      return true
    }, 2),
    tabManager.registerCommand(MOUSE_MOVE_COMMAND, (mouseEvent: MouseEvent) => {
      if(!isMouseDown){
        return false
      }
      if(!movingNode){
        return false
      }
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      const deltaX = mouseEvent.x - startX
      const deltaY = mouseEvent.y - startY
      tabManager.update(() => {
        movingNode!.getWritable()._x = startOffsetX + deltaX / viewportNode._zoom
        movingNode!.getWritable()._y = startOffsetY + deltaY / viewportNode._zoom
        tabManager.dispatchCommand(COMPONENT_NODE_MOVING_COMMAND, {
          nodeKey: movingNode!.__key
        })
      }, {
        tag: 'ignoreHistory'
      })

      return true
    }, 2),
    tabManager.registerCommand(MOUSE_UP_COMMAND, (mouseEvent: MouseEvent) => {
      if(isMouseDown){
        isMouseDown = false
        // 调用这个是为了保存最后一个状态，以供撤销之后重做
        tabManager.update(() => {
          movingNode!.getWritable()._x = movingNode!.getLatest()._x
          movingNode!.getWritable()._y = movingNode!.getLatest()._y
          tabManager.dispatchCommand(COMPONENT_NODE_MOVING_COMMAND, {
            nodeKey: movingNode!.__key
          })
        }, {
          onUpdate() {
            movingNode = undefined
          }
        })
        return true
      }
      return false
    }, 2),
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
