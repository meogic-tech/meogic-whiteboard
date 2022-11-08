<script lang="ts" setup>

import { useTabManager } from "@meogic/tab-manager-vue";
import { useHistory } from "./useHistory";
import { HistoryState } from "../../../tab-manager-history/src";

const props = defineProps<{
  externalHistoryState?: HistoryState
}>()

const editor = useTabManager()
useHistory(editor, props.externalHistoryState)
</script>

<template>
</template>

<style scoped lang="scss">

</style>
