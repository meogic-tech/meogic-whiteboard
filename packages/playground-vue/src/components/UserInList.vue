<script lang="ts" setup>
import {User} from "../model";
import {emitter} from "../plugin/emitter";

const props = defineProps<{
  user: User
}>()
const onClick = () => {
  emitter.emit('checkUserDetail', props.user)
}
</script>

<template>
  <div class="user" @click="onClick">{{props.user.name}}</div>
</template>

<style scoped lang="scss">
.user{
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid lightgray;

  &:not(:last-child){
    margin-bottom: 16px;
  }
  &:hover{
    cursor: pointer;
    background: lightblue;
  }
}
</style>
