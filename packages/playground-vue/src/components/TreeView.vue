<script lang="ts" setup>
import {$getRoot, $isElementNode, ElementNode, WhiteboardNode} from "@meogic/whiteboard";
import {WhiteboardState} from "@meogic/whiteboard";
import {onMounted, ref} from "vue";
import {useWhiteboard} from "@meogic/whiteboard-vue";

const SYMBOLS: Record<string, string> = Object.freeze({
  ancestorHasNextSibling: '|',
  ancestorIsLastChild: ' ',
  hasNextSibling: '├',
  isLastChild: '└',
  selectedChar: '^',
  selectedLine: '>',
});

function printNode(node: WhiteboardNode) {
  let detailObj: any = node.exportJSON()
  delete detailObj.children
  delete detailObj.type
  delete detailObj.version
  return JSON.stringify({
    active: detailObj.active
  })
}

function generateContent(whiteboardState: WhiteboardState): string {
  let res = ' root\n';

  whiteboardState.read(() => {

    visitTree($getRoot(), (node: WhiteboardNode, indent: Array<string>) => {
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
    visitor: (node: WhiteboardNode, indentArr: Array<string>) => void,
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
const whiteboard = useWhiteboard()
onMounted(() => {
  content.value = generateContent(whiteboard.getWhiteboardState())
  whiteboard.registerUpdateListener(({whiteboardState}) => {
    content.value = generateContent(whiteboardState)
    /*setTimeout(() => {
      console.log("whiteboard.getWhiteboardState()._nodeMap", whiteboard.getWhiteboardState()._nodeMap);
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
