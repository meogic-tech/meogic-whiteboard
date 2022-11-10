<script lang="ts" setup>

import { useHistory } from "../composables/useHistory";
import { HistoryState } from "@meogic/whiteboard-history";
import { useWhiteboard } from "../composables/useWhiteboard";

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
