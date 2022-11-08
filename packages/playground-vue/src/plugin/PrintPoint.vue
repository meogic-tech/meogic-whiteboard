<script lang="ts" setup>
import { useTabManager } from "@meogic/tab-manager-vue";
import { onMounted } from "vue";
import { MOUSE_DOWN_COMMAND } from "@meogic/tab-manager";
import { $getPointInWhiteboardFromEventPoint } from "@meogic/tab-manager/src/TabManagerUtils";

const tabManager = useTabManager()

onMounted(() => {
  tabManager.registerCommand(MOUSE_DOWN_COMMAND, (mouseEvent: MouseEvent) => {
    const point = $getPointInWhiteboardFromEventPoint(mouseEvent.x, mouseEvent.y)
    console.log("point", point);
    return false
  }, 1)
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
