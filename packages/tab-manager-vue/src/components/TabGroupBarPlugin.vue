<script lang="ts" setup>
import {onMounted, onUnmounted} from "vue";
import {useTabManager} from "../composables/useTabManager";
import {
  ACTIVE_TAB_COMMAND,
  ADD_TAB_COMMAND,
  CLOSE_TAB_COMMAND,
  COMMAND_PRIORITY_TAB_MANAGER,
  ACTIVE_TAB_GROUP_COMMAND
} from "@meogic/tab-manager";
import {
  $registerActiveTabCommand, $registerActiveTabGroupCommand,
  $registerAddTabCommand,
  $registerCloseTabCommand,
  registerTabNodeMutation
} from "@meogic/tab-manager-tab-group-bar";
import {mergeRegister} from "@meogic/tab-manager-utils";

const tabManager = useTabManager()

let unregisterListener: () => void

onMounted(() => {
  unregisterListener = mergeRegister(
    registerTabNodeMutation(tabManager),
    tabManager.registerCommand(CLOSE_TAB_COMMAND, $registerCloseTabCommand, COMMAND_PRIORITY_TAB_MANAGER),
    tabManager.registerCommand(ADD_TAB_COMMAND, $registerAddTabCommand, COMMAND_PRIORITY_TAB_MANAGER),
    tabManager.registerCommand(ACTIVE_TAB_COMMAND, $registerActiveTabCommand, COMMAND_PRIORITY_TAB_MANAGER),
    tabManager.registerCommand(ACTIVE_TAB_GROUP_COMMAND, $registerActiveTabGroupCommand, COMMAND_PRIORITY_TAB_MANAGER),
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
