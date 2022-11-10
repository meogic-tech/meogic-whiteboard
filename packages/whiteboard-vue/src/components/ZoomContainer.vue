<script lang="ts" setup>

import { useWhiteboard } from "../composables/useWhiteboard";
import { onMounted, onUnmounted } from "vue";
import {
  onWheel
} from "@meogic/whiteboard";

const whiteboard = useWhiteboard()


const handleWheel = (wheelEvent: WheelEvent) => {
  onWheel(wheelEvent, whiteboard)
}

onMounted(() => {
  whiteboard.getRootElement()?.addEventListener('wheel', handleWheel)
})

onUnmounted(() => {
  whiteboard.getRootElement()?.removeEventListener('wheel', handleWheel)
})

</script>

<template>
</template>

<style scoped lang="scss">

</style>
