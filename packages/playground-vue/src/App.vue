<script lang="ts" setup>
import {TabGroupBarPlugin, TabManagerComposer, TabManagerRootElement,TabGroupResizablePlugin, TabGroupDraggablePlugin} from '@meogic/tab-manager-vue'
import {
  $activeTabNode,
  $createTabGroupBarNode, $updateTabGroupBarNode,
  TabGroupBarItemNode,
  TabGroupBarNode
} from "@meogic/tab-manager-tab-group-bar";
import {
  $createResizableTabGroupNode,
  ResizableTabGroupNode
} from "@meogic/tab-manager-resizable";
import {
  $createContainerNode, $createShapeNode,
  $createViewportNode,
  $createWindowNode,
  $getRoot, ACTIVE_TAB_COMMAND, ContainerNode,
  Klass, ShapeNode,
  TabGroupNode,
  TabManagerNode,
  TabManagerThemeClasses, ViewportNode,
  WindowNode
} from "@meogic/tab-manager";
import {createUser, GENDER, User} from "./model";
import UserInList from "./components/UserInList.vue";
import TabManagerOpenPlugin from "./plugin/TabManagerOpenPlugin.vue";
import TabManagerTreePlugin from "./plugin/TabManagerTreePlugin.vue";

import TabManagerActiveTabGroup from "./plugin/TabManagerActiveTabGroup.vue";

import {$createUserTabNode, UserTabNode} from "./nodes/UserTabNode";
import {Decorators} from '@meogic/tab-manager-vue'

import { useI18n } from 'vue-i18n'
import TreeViewPlugin from './plugin/TreeViewPlugin.vue'
import {onMounted} from "vue";
import MoveContainer from "./plugin/MoveContainer.vue";
import { $createBackgroundNode } from "@meogic/tab-manager/src/nodes/BackgroundNode";
import HandleContainerMove from "./plugin/HandleContainerMove.vue";
import ZoomContainer from "./plugin/ZoomContainer.vue";
import PrintPoint from "./plugin/PrintPoint.vue";
import MoveNode from "./plugin/MoveNode.vue";

const PlaygroundNodes: Array<Klass<TabManagerNode>> = [
  WindowNode,
  TabGroupNode,
  ResizableTabGroupNode,
  TabGroupBarNode,
  TabGroupBarItemNode,
  UserTabNode,
  ViewportNode,
  ContainerNode,
  ShapeNode
]

const theme: TabManagerThemeClasses = {
  window: 'PlaygroundTabManagerTheme__window',
  tab: 'PlaygroundTabManagerTheme__tab',
  "tab-group": 'PlaygroundTabManagerTheme__tab-group',
  "tab-group-cover": 'PlaygroundTabManagerTheme__tab-group-cover',
  active: 'PlaygroundTabManagerTheme__active',
  "tab-group-resize-handle": 'PlaygroundTabManagerTheme__tab-group-resize-handle',
  "tab-group-bar": 'PlaygroundTabManagerTheme__tab-group-bar',
  "tab-group-bar-button": 'PlaygroundTabManagerTheme__tab-group-bar-button',
  "tab-group-bar-item": 'PlaygroundTabManagerTheme__tab-group-bar-item',
  "tab-group-bar-item-text": 'PlaygroundTabManagerTheme__tab-group-bar-item-text',
  "tab-group-bar-item-button": 'PlaygroundTabManagerTheme__tab-group-bar-item-button',
  "tab-group-bar-item-draggable": 'PlaygroundTabManagerTheme__tab-group-bar-item-draggable',
}

function prepared() {
  const root = $getRoot();
  const containerNode = $createContainerNode()
  const backgroundNode = $createBackgroundNode(0, 0, 1)
  const viewportNode = $createViewportNode(0, 0, 1)
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
      const shapeNode = $createShapeNode(50 + 200 * i, 50 + 200 * j, 150, 150)
      viewportNode
        .append(shapeNode)
    }
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
  tabManagerState: prepared,
  namespace: 'Playground',
  nodes: [...PlaygroundNodes],
  tabNodes: [UserTabNode],
  tabGroupNodes: [ResizableTabGroupNode],
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
    <div class="tab-manager-container">
      <TabManagerComposer :initial-config="config" @error="onError">
        <TabManagerRootElement/>
        <TabGroupBarPlugin/>
        <TabManagerOpenPlugin/>
        <Decorators/>
        <TabManagerActiveTabGroup/>
<!--        <TabGroupResizablePlugin/>-->
<!--        <TabGroupDraggablePlugin/>-->
<!--        <TreeViewPlugin/>-->
        <MoveContainer/>
        <HandleContainerMove/>
        <ZoomContainer/>
        <PrintPoint/>
        <MoveNode/>
      </TabManagerComposer>
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
  .tab-manager-container{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

</style>
