<script lang="ts" setup>

import {useTabManager} from "@meogic/tab-manager-vue";
import {onMounted} from "vue";
import {emitter} from "./emitter";
import {User} from "../model";
import {$getRoot, ACTIVE_TAB_COMMAND} from "@meogic/tab-manager";
import {$isWindowNode} from "@meogic/tab-manager";
import {$isTabGroupNode, TabGroupNode} from "@meogic/tab-manager";
import {$createUserTabNode} from "../nodes/UserTabNode";
import {$getNodeByKey} from "@meogic/tab-manager";
import {$activeTabNode, $updateTabGroupBarNode} from "@meogic/tab-manager-tab-group-bar";

const tabManager = useTabManager()
let unregisterListener: () => void
onMounted(() => {
  emitter.on('checkUserDetail', (user: User) => {
    const tabGroupNodeKey = tabManager.getTabManagerState().read(() => {
      const root = $getRoot()
      const firstChild = root.getFirstChild()
      if(!firstChild || !$isWindowNode(firstChild)){
        return
      }
      const activeTabGroupNodes = firstChild.getChildren().filter(
          (tabGroupNode) => {
            if(!$isTabGroupNode(tabGroupNode)){
              return false
            }
            return tabGroupNode.getActive()
          }
      )
      if(!activeTabGroupNodes || activeTabGroupNodes.length === 0){
        return;
      }
      const tabGroupNode = activeTabGroupNodes[0]
      if(!tabGroupNode || !$isTabGroupNode(tabGroupNode)){
        return;
      }
      return tabGroupNode.getKey();
    })
    if(!tabGroupNodeKey){
      return
    }
    tabManager.update(() => {
      const tabGroupNode = $getNodeByKey(tabGroupNodeKey)
      if(!$isTabGroupNode(tabGroupNode)){
        return
      }
      const userTabNode = $createUserTabNode(user)
      tabGroupNode.append(userTabNode)
      $updateTabGroupBarNode(tabGroupNode)
      tabManager.dispatchCommand(ACTIVE_TAB_COMMAND, {
        tabNodeKey: userTabNode.getKey()
      })
      // $activeTabNode(userTabNode)
    }, {
      onUpdate() {
        const tabManagerState = tabManager.getTabManagerState()
        console.log("tabManagerState", tabManagerState._nodeMap);
      }
    })
  })
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
