<script lang="ts" setup>

import {useTabManager} from "../";
import {onMounted, onUnmounted} from "vue";
import {mergeRegister} from "@meogic/tab-manager-utils";
import {COMMAND_PRIORITY_TAB_MANAGER, MOUSE_DOWN_COMMAND, MOUSE_MOVE_COMMAND, MOUSE_UP_COMMAND} from "@meogic/tab-manager";
import {$registerMouseDown, $registerMouseMove, $registerMouseUp} from "@meogic/tab-manager-draggable";

const tabManager = useTabManager()
let unregisterListener: () => void
onMounted(() => {
  unregisterListener = mergeRegister(
      tabManager.registerCommand(MOUSE_DOWN_COMMAND, $registerMouseDown, COMMAND_PRIORITY_TAB_MANAGER),
      tabManager.registerCommand(MOUSE_MOVE_COMMAND, $registerMouseMove, COMMAND_PRIORITY_TAB_MANAGER),
      tabManager.registerCommand(MOUSE_UP_COMMAND, $registerMouseUp, COMMAND_PRIORITY_TAB_MANAGER)
  )
})
onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
