<script lang="ts" setup>

import { useTabManager } from "@meogic/tab-manager-vue";
import { onMounted, onUnmounted } from "vue";
import { $isViewportNode, ViewportNode } from "@meogic/tab-manager";
import { $getPointInWhiteboardFromEventPoint, $getViewportNode } from "@meogic/tab-manager/src/TabManagerUtils";

const tabManager = useTabManager()
let unregister: () => void


const onWheel = (event: WheelEvent) => {
  if(event.metaKey){
    return
  }
  tabManager.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      console.warn('not found viewport node');
      return;
    }
    const oldZoom = viewportNode.getLatest()._zoom
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
  tabManager.getRootElement()?.addEventListener('wheel', onWheel)
})

onUnmounted(() => {
  tabManager.getRootElement()?.removeEventListener('wheel', onWheel)
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
