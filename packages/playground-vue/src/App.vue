<script lang="ts" setup>
import {WhiteboardComposer, WhiteboardRootElement} from '@meogic/whiteboard-vue'
import {
  $createContainerNode, $createShapeNode,
  $createViewportNode,
  $getRoot, ContainerNode,
  Klass, ShapeNode,
  WhiteboardNode,
  WhiteboardThemeClasses, ViewportNode,
  $createBackgroundNode,
  $createLinkNode, LinkNode,
  $createLinkContainerNode
} from "@meogic/whiteboard";

import {Decorators} from '@meogic/whiteboard-vue'

import { useI18n } from 'vue-i18n'
import MoveContainer from "./plugin/MoveContainer.vue";
import HandleContainerMove from "./plugin/HandleContainerMove.vue";
import ZoomContainer from "./plugin/ZoomContainer.vue";
import PrintPoint from "./plugin/PrintPoint.vue";
import MoveNode from "./plugin/MoveNode.vue";
import MoveLink from "./plugin/MoveLink.vue";
import History from "./plugin/History.vue";

const PlaygroundNodes: Array<Klass<WhiteboardNode>> = [
  ViewportNode,
  ContainerNode,
  ShapeNode,
  LinkNode
]

const theme: WhiteboardThemeClasses = {
  active: 'PlaygroundWhiteboardTheme__active',
}

function prepared() {
  const root = $getRoot();
  const containerNode = $createContainerNode()
  const backgroundNode = $createBackgroundNode(0, 0, 2)
  const viewportNode = $createViewportNode(0, 0, 2)
  const linkContainerNode = $createLinkContainerNode()
  viewportNode.append(linkContainerNode)
  const keys = []
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      const shapeNode = $createShapeNode(50 + 200 * i, 50 + 200 * j, 150, 150)
      keys.push(shapeNode.__key)
      viewportNode
        .append(shapeNode)
    }
  }

  for (let i = 0; i < keys.length-1; i+=2) {
    const linkNode = $createLinkNode(keys[i], keys[i+1])
    linkContainerNode.append(linkNode)
  }




  root.append(
    containerNode
      .append(
        viewportNode
      )
    ,backgroundNode
  )
}
const config = {
  whiteboardState: prepared,
  namespace: 'Playground',
  nodes: [...PlaygroundNodes],
  theme
}
const onError = (error: Error) => {
  throw error;
}
const { locale, t } = useI18n({
  inheritLocale: true
})
</script>

<template>
  <div class="bar">
    <div class="hello">{{ t('hello') }}</div>
    <div class="language-setting">
      <label>{{ t('language') }}</label>
      <select v-model="$i18n.locale">
        <option value="en">en</option>
        <option value="cn">cn</option>
      </select>
    </div>
  </div>
  <div class="main">
    <div class="whiteboard-container">
      <WhiteboardComposer :initial-config="config" @error="onError">
        <WhiteboardRootElement/>
        <Decorators/>
        <MoveContainer/>
        <HandleContainerMove/>
        <ZoomContainer/>
        <PrintPoint/>
        <MoveNode/>
        <MoveLink/>
        <History/>
      </WhiteboardComposer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bar{
  background: white;
  color: black;
  display: flex;
  height: 64px;
  line-height: 64px;
  padding: 0 24px;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.main{
  height: calc(100vh - 64px);
  width: 100%;
  display: flex;
  .user-list{
    width: 300px;
    padding: 8px 16px;
  }
  .whiteboard-container{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

</style>
