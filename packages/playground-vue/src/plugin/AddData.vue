<script lang="ts" setup>
import { onMounted } from "vue";
import { useWhiteboard } from "@meogic/whiteboard-vue";
import {
  $createLinkContainerNode,
  $createLinkNode,
  $createShapeNode,
  $getViewportNode
} from "@meogic/whiteboard";
import { $createTextNode } from "@meogic/whiteboard-vue";

const whiteboard = useWhiteboard()

const addData = () => {
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      return
    }

  })
}

onMounted(() => {
  setTimeout(() => {
    addData()
  }, 200)
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
