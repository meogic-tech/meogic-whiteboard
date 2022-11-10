<script lang="ts" setup>

import { useWhiteboard } from "../composables/useWhiteboard";
import { onMounted, onUnmounted } from "vue";
import { $isViewportNode, ViewportNode,  $getPointInWhiteboardFromEventPoint, $getViewportNode } from "@meogic/whiteboard";
import { IS_APPLE } from "shared/environment";

const whiteboard = useWhiteboard()
let unregister: () => void


const onWheel = (event: WheelEvent) => {
  if(IS_APPLE && !event.metaKey){
    return
  }
  if(!IS_APPLE && !event.ctrlKey){
    return
  }
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      console.warn('not found viewport node');
      return;
    }
    const oldZoom = viewportNode.getLatest()._zoom
    // @ts-ignore
    let newZoom = oldZoom + (event.wheelDeltaY > 0 ? 0.1 : -0.1);
    newZoom = Math.max(0.1, newZoom)
    newZoom = Math.round(newZoom * 100) / 100
    const zoomRatio = newZoom - oldZoom
    const point = $getPointInWhiteboardFromEventPoint(event.x, event.y)
    if(!point){
      return;
    }
    // 在当前视图的x
    const xInView = viewportNode.getLatest()._offsetX + point.x
    // 在当前视图的y
    const yInView = viewportNode.getLatest()._offsetY + point.y
    const oldX = viewportNode.getLatest()._offsetX
    const oldY = viewportNode.getLatest()._offsetY
    const deltaX = point.x * zoomRatio
    const deltaY = point.y * zoomRatio
    viewportNode.getWritable()._zoom = newZoom
    viewportNode.getWritable()._offsetX = -deltaX + oldX
    viewportNode.getWritable()._offsetY = -deltaY + oldY
  })



}

onMounted(() => {
  whiteboard.getRootElement()?.addEventListener('wheel', onWheel)
})

onUnmounted(() => {
  whiteboard.getRootElement()?.removeEventListener('wheel', onWheel)
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
