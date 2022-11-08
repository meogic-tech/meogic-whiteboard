<script lang="ts" setup>

import {onMounted, ref} from "vue";
import {useTabManager} from "../composables/useTabManager";

const root = ref<HTMLElement | null>(null)
const tabManager = useTabManager()

onMounted(() => {
  if(root.value) {
    tabManager.setRootElement(root.value)
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
