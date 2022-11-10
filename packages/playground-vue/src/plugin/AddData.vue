<script lang="ts" setup>
import { onMounted } from "vue";
import { useWhiteboard } from "@meogic/whiteboard-vue";
import {
  $createLinkContainerNode,
  $createLinkNode,
  $createShapeNode,
  $createTextNode,
  $getViewportNode
} from "@meogic/whiteboard";

const whiteboard = useWhiteboard()

const addData = () => {
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      return
    }
    const linkContainerNode = $createLinkContainerNode()
    viewportNode.append(linkContainerNode)
    const keys = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
          const textNode = $createTextNode(50 + 500 * i, 50 + 1000 * j, 350, 150,
            '<h1 class="PlaygroundEditorTheme__h1 PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Welcome to the playground</span></h1><blockquote class="PlaygroundEditorTheme__quote PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">In case you were wondering what the black box at the bottom is – it\'s the debug view, showing the current state of editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.</span></blockquote><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">The playground is a demo environment built with </span><code data-lexical-text="true"><span class="PlaygroundEditorTheme__textCode">@lexical/react</span></code><span data-lexical-text="true">. Try typing in </span><strong class="PlaygroundEditorTheme__textBold" data-lexical-text="true">some text</strong><span data-lexical-text="true"> with </span><em class="PlaygroundEditorTheme__textItalic" data-lexical-text="true">different</em><span data-lexical-text="true"> formats.</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Make sure to check out the various plugins in the toolbar. You can also use </span><span class="PlaygroundEditorTheme__hashtag" data-lexical-text="true">#hashtags</span><span data-lexical-text="true"> or @-mentions too!</span></p><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">If you\'d like to find out more about Lexical, you can:</span></p><ul class="PlaygroundEditorTheme__ul"><li value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Visit the </span><a href="https://lexical.dev/" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lexical website</span></a><span data-lexical-text="true"> for documentation and more information.</span></li><li value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Check out the code on our </span><a href="https://github.com/facebook/lexical" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">GitHub repository</span></a><span data-lexical-text="true">.</span></li><li value="3" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Playground code can be found </span><a href="https://github.com/facebook/lexical/tree/main/packages/lexical-playground" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">here</span></a><span data-lexical-text="true">.</span></li><li value="4" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Join our </span><a href="https://discord.com/invite/KmG4wQnnD9" class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Discord Server</span></a><span data-lexical-text="true"> and chat with the team.</span></li></ul><p class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr" dir="ltr"><span data-lexical-text="true">Lastly, we\'re constantly adding cool new features to this playground. So make sure you check back here when you next get a chance </span><span class="emoji happysmile" data-lexical-text="true"><span class="emoji-inner">🙂</span></span><span data-lexical-text="true">.</span></p>',
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
  })
}

onMounted(() => {
  setTimeout(() => {
    addData()
  }, 200)
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
