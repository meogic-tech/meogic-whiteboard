<script lang="ts" setup>
import {User} from "../model";
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  user: User
}>()
const { locale, t } = useI18n({
  inheritLocale: true
})
const onBlur = (event: FocusEvent) => {
  console.log('blur', event)
  if(event.relatedTarget === null){
    event.preventDefault()
  }
}

</script>

<template>
  <div>
    <h1 class="user">{{ t('name') }}：{{props.user.name}}</h1>
    <div>
      {{ t('gender') }}: {{props.user.gender === 0 ? t('male'): t('female')}}
    </div>
    <div>
      <select>
        <option>0</option>
        <option>1</option>
      </select>
    </div>
    <div contenteditable="true" style="height: 200px;width: 100%;outline: 1px solid blue" @blur="onBlur">

    </div>
    <div>
      foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar foo bar foo bar foo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo barfoo bar foo bar
    </div>
  </div>

</template>

<style scoped lang="css">

</style>
