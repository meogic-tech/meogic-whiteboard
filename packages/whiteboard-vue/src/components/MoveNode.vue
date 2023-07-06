<script lang="ts" setup>
import { useWhiteboard } from "../composables/useWhiteboard";
import { onMounted, onUnmounted } from "vue";
import {
  $getNearestNodeInheritTypeFromDOMNode,
  $getNearestNodeTypeFromDOMNode, $getViewportNode, COMPONENT_NODE_MOVING_COMMAND, DecoratorNode,
  MOUSE_DOWN_COMMAND,
  MOUSE_MOVE_COMMAND,
  MOUSE_UP_COMMAND,
  ShapeNode, WhiteboardNode, $getEventPointFromWhiteboardPoint
} from "@meogic/whiteboard";
import { mergeRegister } from "@meogic/whiteboard-utils";
import { $isTextNode, TextNode } from "../nodes";
const whiteboard = useWhiteboard()
let unregister: () => void
let isMouseDown = false
let startX = 0
let startY = 0
let startOffsetX = 0
let startOffsetY = 0
let movingNode: ShapeNode | TextNode | undefined
let selectedNodes: WhiteboardNode[] = []
let isMoved = false

onMounted(() => {
  unregister = mergeRegister(
    whiteboard.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
      isMoved = false
      const node111 = $getNearestNodeInheritTypeFromDOMNode(mouseEvent.target as HTMLElement, DecoratorNode)
      let node: ShapeNode|TextNode | undefined = $getNearestNodeTypeFromDOMNode(mouseEvent.target as HTMLElement, ShapeNode) as ShapeNode
      if(!node){
        node = $getNearestNodeTypeFromDOMNode(mouseEvent.target as HTMLElement, TextNode) as TextNode
        if(!node){
          for (let whiteboardNode of selectedNodes) {
            if($isTextNode(whiteboardNode)){
              whiteboardNode.setSelected(false)
              whiteboardNode.setEditing(false)
            }
          }
          selectedNodes = []
          return false
        }
        if(!node.getSelected()){
          node.setSelected(true)
          selectedNodes.push(node)
        }
      }
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
    whiteboard.registerCommand(MOUSE_MOVE_COMMAND, (mouseEvent: MouseEvent) => {
      mouseEvent.preventDefault()
      if(!isMouseDown){
        console.warn('isMouseDown is not');
        return false
      }
      if(!movingNode){
        console.warn('movingNode is ', movingNode);
        return false
      }
      isMoved = true
      const viewportNode = $getViewportNode()
      if(!viewportNode){
        return false
      }
      const deltaX = mouseEvent.x - startX
      const deltaY = mouseEvent.y - startY
      whiteboard.update(() => {
        movingNode?.setX(startOffsetX + deltaX / viewportNode._zoom)
        movingNode?.setY(startOffsetY + deltaY / viewportNode._zoom)

        whiteboard.dispatchCommand(COMPONENT_NODE_MOVING_COMMAND, {
          nodeKey: movingNode!.__key
        })
      }, {
        tag: 'ignoreHistory'
      })

      return true
    }, 2),
    whiteboard.registerCommand(MOUSE_UP_COMMAND, (mouseEvent: MouseEvent) => {
      if(isMouseDown){
        isMouseDown = false
        // 调用这个是为了保存最后一个状态，以供撤销之后重做
        whiteboard.update(() => {
          movingNode!.getWritable()._x = movingNode!.getLatest()._x
          movingNode!.getWritable()._y = movingNode!.getLatest()._y
          whiteboard.dispatchCommand(COMPONENT_NODE_MOVING_COMMAND, {
            nodeKey: movingNode!.__key
          })
          if(!isMoved){
            if($isTextNode(movingNode)){
              // movingNode.getWritable()._editing = true
            }
          }else{
            isMoved = false
          }
        }, {
          onUpdate() {
            movingNode = undefined
          },
          tag: 'add-history'
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
