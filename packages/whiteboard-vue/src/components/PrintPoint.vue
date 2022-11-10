<script lang="ts" setup>
import { useWhiteboard } from "../composables/useWhiteboard";
import { onMounted } from "vue";
import { $getPointInWhiteboardFromEventPoint, MOUSE_DOWN_COMMAND } from "@meogic/whiteboard";

const whiteboard = useWhiteboard()

onMounted(() => {
  whiteboard.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
    const point = $getPointInWhiteboardFromEventPoint(mouseEvent.x, mouseEvent.y)
    return false
  }, 1)
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
