<script lang="ts" setup>

import { onMounted, onUnmounted, ref } from "vue";
/**
 * 这里一定不能用@meogic/whiteboard-vue，否则会报错 Failed to resolve entry for package "@meogic/whiteboard-vue"
 */
import { useWhiteboard } from "../composables/useWhiteboard";
import { $getPointInWhiteboardFromEventPoint } from "@meogic/whiteboard";

const whiteboard = useWhiteboard()

const pointRef = ref<{x: number, y: number}>({
  x: 0,
  y: 0
})

const onMouseMove = (mouseEvent: MouseEvent) => {
  whiteboard.update(() => {
    const point =  $getPointInWhiteboardFromEventPoint(mouseEvent.x, mouseEvent.y)
    if(point){
      pointRef.value.x = point.x
      pointRef.value.y = point.y
    }
  })

}

onMounted(() => {
  whiteboard.getRootElement()?.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  whiteboard.getRootElement()?.removeEventListener('mousemove', onMouseMove)
})

</script>

<template>
  <Teleport to="#app">
    <div class="point-container">
      <p>{{ pointRef.x.toString() }}</p>
      <p>{{ pointRef.y.toString() }}</p>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.point-container{
  position: absolute;
  top: 0;
  left: 0;
}
</style>
