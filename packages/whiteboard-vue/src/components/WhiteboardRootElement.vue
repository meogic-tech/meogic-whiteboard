<script lang="ts" setup>

import {onMounted, ref} from "vue";
import {useWhiteboard} from "../composables/useWhiteboard";

const root = ref<HTMLElement | null>(null)
const whiteboard = useWhiteboard()

onMounted(() => {
  if(root.value) {
    whiteboard.setRootElement(root.value)
  }
})

</script>

<template>
  <div
      ref="root"
      class="container"
      tabindex="-1"
     style="height: 100%;width: 100%;position: relative"
  />
</template>

<style scoped lang="scss">
.container{
  &:hover{
    cursor: grab;
  }
}
</style>
