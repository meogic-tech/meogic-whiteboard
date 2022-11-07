<script lang="ts" setup>
import {$getRoot, $isElementNode, ElementNode, TabManagerNode} from "@meogic/tab-manager";
import {TabManagerState} from "@meogic/tab-manager";
import {onMounted, ref} from "vue";
import {useTabManager} from "@meogic/tab-manager-vue";

const SYMBOLS: Record<string, string> = Object.freeze({
  ancestorHasNextSibling: '|',
  ancestorIsLastChild: ' ',
  hasNextSibling: '├',
  isLastChild: '└',
  selectedChar: '^',
  selectedLine: '>',
});

function printNode(node: TabManagerNode) {
  let detailObj: any = node.exportJSON()
  delete detailObj.children
  delete detailObj.type
  delete detailObj.version
  return JSON.stringify({
    active: detailObj.active
  })
}

function generateContent(tabManagerState: TabManagerState): string {
  let res = ' root\n';

  tabManagerState.read(() => {

    visitTree($getRoot(), (node: TabManagerNode, indent: Array<string>) => {
      const nodeKey = node.getKey();
      const nodeKeyDisplay = `(${nodeKey})`;
      const typeDisplay = node.getType() || '';
      const idsDisplay = '';

      res += `${' '} ${indent.join(
          ' ',
      )} ${nodeKeyDisplay} ${typeDisplay} ${idsDisplay} ${printNode(node)}\n`;

    });
    return
  });

  return res;
}

function visitTree(
    currentNode: ElementNode,
    visitor: (node: TabManagerNode, indentArr: Array<string>) => void,
    indent: Array<string> = [],
) {
  const childNodes = currentNode.getChildren();
  const childNodesLength = childNodes.length;

  childNodes.forEach((childNode, i) => {
    visitor(
        childNode,
        indent.concat(
            i === childNodesLength - 1
                ? SYMBOLS.isLastChild
                : SYMBOLS.hasNextSibling,
        ),
    );

    if ($isElementNode(childNode)) {
      visitTree(
          childNode,
          visitor,
          indent.concat(
              i === childNodesLength - 1
                  ? SYMBOLS.ancestorIsLastChild
                  : SYMBOLS.ancestorHasNextSibling,
          ),
      );
    }
  });
}
const content = ref<string>('')
const tabManager = useTabManager()
onMounted(() => {
  content.value = generateContent(tabManager.getTabManagerState())
  tabManager.registerUpdateListener(({tabManagerState}) => {
    content.value = generateContent(tabManagerState)
    /*setTimeout(() => {
      console.log("tabManager.getTabManagerState()._nodeMap", tabManager.getTabManagerState()._nodeMap);
    }, 200)*/
  })
})
</script>

<template>
  <pre>
    {{content}}
  </pre>
</template>

<style scoped lang="scss">

</style>
