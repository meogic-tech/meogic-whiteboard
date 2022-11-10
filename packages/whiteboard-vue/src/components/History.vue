<script lang="ts" setup>

import { useWhiteboard } from "@meogic/whiteboard-vue";
import { useHistory } from "../composables/useHistory";
import { HistoryState } from "@meogic/whiteboard-history";

const props = defineProps<{
  externalHistoryState?: HistoryState
}>()

const editor = useWhiteboard()
useHistory(editor, props.externalHistoryState)
</script>

<template>
</template>

<style scoped lang="scss">

</style>
