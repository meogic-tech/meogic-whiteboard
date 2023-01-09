<script lang="ts" setup>
import { $createTextNode, WhiteboardComposer, WhiteboardRootElement } from "@meogic/whiteboard-vue";
import {
  $createContainerNode, $createShapeNode,
  $createViewportNode,
  $getRoot, ContainerNode,
  Klass, ShapeNode,
  WhiteboardNode,
  WhiteboardThemeClasses, ViewportNode,
  $createBackgroundNode,
  $createLinkNode, LinkNode,
  $createLinkContainerNode,
} from "@meogic/whiteboard";

import {Decorators,
  MoveContainer,
  HandleContainerMove,
  ZoomContainer,
  PrintPoint,
  MoveNode,
  MoveLink,
  History,
} from '@meogic/whiteboard-vue'

import { useI18n } from 'vue-i18n'
import AddData from "./plugin/AddData.vue";
import { TextNode, ShowPoint, AuxiliaryLineGridLayout } from "@meogic/whiteboard-vue";
import {
  $createAuxiliaryLineContainerNode, $createBoundaryAuxiliaryLineNode,
  AuxiliaryLineContainerNode,
  BoundaryAuxiliaryLineNode
} from "@meogic/whiteboard/src/nodes";


const PlaygroundNodes: Array<Klass<WhiteboardNode>> = [
  ViewportNode,
  ContainerNode,
  ShapeNode,
  LinkNode,
  TextNode,
  AuxiliaryLineContainerNode,
  BoundaryAuxiliaryLineNode,
]

const theme: WhiteboardThemeClasses = {
  selected: 'PlaygroundWhiteboardTheme__selected',
  active: 'PlaygroundWhiteboardTheme__active',
}

function prepared() {
  const root = $getRoot();
  const containerNode = $createContainerNode()
  // const backgroundNode = $createBackgroundNode(900, 600, 2)
  // const viewportNode = $createViewportNode(900, 600, 2)
  const backgroundNode = $createBackgroundNode(0, 0, 1)
  const viewportNode = $createViewportNode(0, 0, 1)

  const linkContainerNode = $createLinkContainerNode()
  viewportNode.append(linkContainerNode)


  const auxiliaryLineContainerNode = $createAuxiliaryLineContainerNode()
  viewportNode.append(auxiliaryLineContainerNode)

  const keys = []
  const textNode = $createTextNode(0, 0, 350, 150,
    `<h1 class="PlaygroundEditorTheme__h1 PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Welcome to the playground</span></h1><blockquote class="PlaygroundEditorTheme__quote PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">In case you were wondering what the black box at the bottom is – it\'s the debug view, showing the current state of editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.</span></blockquote><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">The playground is a demo environment built with </span><code data-lexical-text="true"><span class="PlaygroundEditorTheme__textCode">@lexical/react</span></code><span data-lexical-text="true">. Try typing in </span><strong class="PlaygroundEditorTheme__textBold" data-lexical-text="true">some text</strong><span data-lexical-text="true"> with </span><em class="PlaygroundEditorTheme__textItalic" data-lexical-text="true">different</em><span data-lexical-text="true"> formats.</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Make sure to check out the various plugins in the toolbar. You can also use </span><span class="PlaygroundEditorTheme__hashtag" data-lexical-text="true">#hashtags</span><span data-lexical-text="true"> or @-mentions too!</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">If you\'d like to find out more about Lexical, you can:</span></p><ul class="PlaygroundEditorTheme__ul"><li value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Visit the </span><a href="https://lexical.dev/" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lexical website</span></a><span data-lexical-text="true"> for documentation and more information.</span></li><li value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Check out the code on our </span><a href="https://github.com/facebook/lexical" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">GitHub repository</span></a><span data-lexical-text="true">.</span></li><li value="3" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Playground code can be found </span><a href="https://github.com/facebook/lexical/tree/main/packages/lexical-playground" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">here</span></a><span data-lexical-text="true">.</span></li><li value="4" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Join our </span><a href="https://discord.com/invite/KmG4wQnnD9" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Discord Server</span></a><span data-lexical-text="true"> and chat with the team.</span></li></ul><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lastly, we\'re constantly adding cool new features to this playground. So make sure you check back here when you next get a chance </span><span class="emoji happysmile" data-lexical-text="true"><span class="emoji-inner">🙂</span></span><span data-lexical-text="true">.</span></p>`,
    false,
    false
  )
  viewportNode
    .append(textNode)
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 5; j++) {
      const textNode = $createTextNode(-50 + 500 * j, 300 + 1000 * i, 350, 150,
        `<h1 class="PlaygroundEditorTheme__h1 PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Welcome to the playground${i},${j}</span></h1><blockquote class="PlaygroundEditorTheme__quote PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">In case you were wondering what the black box at the bottom is – it\'s the debug view, showing the current state of editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.</span></blockquote><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">The playground is a demo environment built with </span><code data-lexical-text="true"><span class="PlaygroundEditorTheme__textCode">@lexical/react</span></code><span data-lexical-text="true">. Try typing in </span><strong class="PlaygroundEditorTheme__textBold" data-lexical-text="true">some text</strong><span data-lexical-text="true"> with </span><em class="PlaygroundEditorTheme__textItalic" data-lexical-text="true">different</em><span data-lexical-text="true"> formats.</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Make sure to check out the various plugins in the toolbar. You can also use </span><span class="PlaygroundEditorTheme__hashtag" data-lexical-text="true">#hashtags</span><span data-lexical-text="true"> or @-mentions too!</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">If you\'d like to find out more about Lexical, you can:</span></p><ul class="PlaygroundEditorTheme__ul"><li value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Visit the </span><a href="https://lexical.dev/" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lexical website</span></a><span data-lexical-text="true"> for documentation and more information.</span></li><li value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Check out the code on our </span><a href="https://github.com/facebook/lexical" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">GitHub repository</span></a><span data-lexical-text="true">.</span></li><li value="3" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Playground code can be found </span><a href="https://github.com/facebook/lexical/tree/main/packages/lexical-playground" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">here</span></a><span data-lexical-text="true">.</span></li><li value="4" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Join our </span><a href="https://discord.com/invite/KmG4wQnnD9" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Discord Server</span></a><span data-lexical-text="true"> and chat with the team.</span></li></ul><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lastly, we\'re constantly adding cool new features to this playground. So make sure you check back here when you next get a chance </span><span class="emoji happysmile" data-lexical-text="true"><span class="emoji-inner">🙂</span></span><span data-lexical-text="true">.</span></p>`,
        false,
        false
      )
      viewportNode
        .append(textNode)
      keys.push(textNode.__key)
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
        <AddData/>
        <ShowPoint/>
        <AuxiliaryLineGridLayout/>
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
