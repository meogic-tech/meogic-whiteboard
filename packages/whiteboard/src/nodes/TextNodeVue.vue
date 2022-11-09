<script lang="ts" setup>
import { SerializedTextNode } from "@meogic/whiteboard";
import { onMounted, ref, watchEffect } from "vue";

//region 数据
const props = defineProps<{
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  selected: boolean
}>()

const style = ref({
  'user-select': 'none',
  'pointer-events': 'none',
  'outline': 'none'
})
const contenteditable = ref(false)
const editor = ref<HTMLElement | undefined>()
const foreignObjectHeight = ref<number>(props.height!)
const classNames = ref<string>("")
//endregion

//region 事件
watchEffect(() => {
  if(props.selected){
    style.value = {
    }
    contenteditable.value = true
    classNames.value = 'hover-text-select'
  }else{
    style.value = {
      'user-select': 'none',
      'pointer-events': 'none'
    }
    contenteditable.value = false
  }
})
const onMousedown =  (mouseEvent: MouseEvent) => {
  if(props.selected){
    mouseEvent.stopPropagation()
  }
}
const onInput = () => {
  foreignObjectHeight.value = editor.value!.offsetHeight + 16 + 2
}
//endregion



onMounted(() => {
  foreignObjectHeight.value = editor.value!.offsetHeight + 16 + 2
})




</script>

<template>
  <foreignObject :x="props.x"
                 :y="props.y"
                 :width="props.width"
                 :height="foreignObjectHeight"
                 class="editor-container"
  >
    <div ref="editor" :class="classNames"
          class="editor" :style="style" :contenteditable="contenteditable"
         v-html="props.text"
         @mousedown="onMousedown"
         @input="onInput"
    >
    </div>

  </foreignObject>
</template>

<style scoped lang="scss">
.editor-container{
  filter: drop-shadow( 3px 3px 10px rgba(0, 0, 0, .2));
  border-radius: 16px;
}
.hover-text-select{
  cursor: text;
}
.editor{
  border-radius: 16px;
  border: 1px solid transparent;
  background: white;
  padding: 8px 16px;
  &:focus{
    outline: none;
    border: 1px solid blue;
  }
}
</style>
