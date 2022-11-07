import {$isTabNode, TabNode} from "@meogic/tab-manager";
import {$getNodeByKey} from "@meogic/tab-manager";
import {$isTabGroupNode, TabGroupNode} from "@meogic/tab-manager";
import {$createTabGroupBarNode, $isTabGroupBarNode, TabGroupBarNode} from "./TabGroupBarNode";
import {$createTabGroupBarItemNode, $isTabGroupBarItemNode, TabGroupBarItemNode} from "./TabGroupBarItemNode";
import {NodeKey, TabManager} from "@meogic/tab-manager";
import {getActiveTabManagerState} from "@meogic/tab-manager";

export type {
    SerializedTabGroupBarNode,
} from './TabGroupBarNode'
export {
    TabGroupBarNode,
    $createTabGroupBarNode,
    $isTabGroupBarNode
} from './TabGroupBarNode'


export type {
    SerializedTabGroupBarItemNode,
} from './TabGroupBarItemNode'
export {
    TabGroupBarItemNode,
    $createTabGroupBarItemNode,
    $isTabGroupBarItemNode
} from './TabGroupBarItemNode'

const TabGroupNodeUpdateTag = 'tabGroupNodeUpdateTag'


//region 对tabNode的操作
export const $activeTabNodeByKey = (nodeKey: NodeKey) => {
    const node = $getNodeByKey(nodeKey)
    if(!$isTabNode(node)){
        return
    }
    return $activeTabNode(node)
}

export const $activeTabNode = (node: TabNode<unknown>) => {
    // 设置当前为active
    node.setActive(true)
    // 设置其它的为inactive
    node.getParent()?.getChildren()
        .filter((c) => $isTabNode(c) && c.getKey() !== node.getKey())
        .forEach((n) => {
            if(!$isTabNode(n)){
                return
            }
            n.setActive(false)
        })
    // 设置对应的tabGroupBarItemNode为active
    const tabGroupBarItemNode = $findTabGroupBarItemNodeByTabNodeKey(node.getKey())
    if(!tabGroupBarItemNode){
        return
    }
    tabGroupBarItemNode.setActive(true)
    // 设置其它的为inactive
    tabGroupBarItemNode.getParent()?.getChildren()
        .filter((c) => $isTabGroupBarItemNode(c) && c.getKey() !== tabGroupBarItemNode.getKey())
        .forEach((n) => {
            if(!$isTabGroupBarItemNode(n)){
                return
            }
            n.setActive(false)
        })
}
//endregion

//region 对tabGroupNode的操作
export const $activeTabGroupNodeByKey = (nodeKey: NodeKey) => {
    const node = $getNodeByKey(nodeKey)
    if(!$isTabGroupNode(node)){
        return
    }
    return $activeTabGroupNode(node)
}

export const $activeTabGroupNode = (node: TabGroupNode) => {
    // 设置当前为active
    node.setActive(true)
    // 设置其它的为inactive
    node.getParent()?.getChildren()
        .filter((c) => $isTabGroupNode(c) && c.getKey() !== node.getKey())
        .forEach((n) => {
            if(!$isTabGroupNode(n)){
                return
            }
            n.setActive(false)
        })
}
//endregion

//region 对tabGroupBar的操作
export const $updateTabGroupBarNode = (tabGroupNode: TabGroupNode) => {
    const tabGroupBarNodes = tabGroupNode.getChildren().filter((c) => $isTabGroupBarNode(c))
    let tabGroupBarNode
    if(tabGroupBarNodes.length === 0){
        tabGroupBarNode = $createTabGroupBarNode()
        tabGroupNode.insertAtFirst(tabGroupBarNode)
    }
    tabGroupBarNode = tabGroupBarNodes[0] as TabGroupBarNode
    // 所有的tabNodeKey
    const tabNodeKeys = tabGroupNode.getChildren().filter((c) => $isTabNode(c)).map(c => c.getKey())
    const tabNodeKeysInBar = tabGroupBarNode.getChildren().filter((c) => $isTabGroupBarItemNode(c))
        .map((c) => {
            return c.getBindTabNodeKey()
        })
    // 找到要添加的
    const keyToAdd: NodeKey[] = []
    for (let key1 of tabNodeKeys) {
        let isFind = false
        for (let key2 of tabNodeKeysInBar) {
            if(key1 === key2){
                isFind = true
                break
            }
        }
        if(!isFind){
            keyToAdd.push(key1)
        }
    }
    // 找到要删除的
    const keyToDelete: NodeKey[] = []
    for (let key1 of tabNodeKeysInBar) {
        let isDelete = true
        for (let key2 of tabNodeKeys) {
            if(key1 === key2){
                isDelete = false
                break
            }
        }
        if(isDelete){
            keyToDelete.push(key1)
        }
    }

    // 添加
    for (let key of keyToAdd) {
        const tabNode = $getNodeByKey(key)
        if(!tabNode || !$isTabNode(tabNode)){
            continue
        }
        const tabGroupBarItemNode = $createTabGroupBarItemNode(tabNode.getKey(), tabNode.getName())
        tabGroupBarNode.append(tabGroupBarItemNode)
    }
    // 删除
    for (let key of keyToDelete) {
        for (let child of tabGroupBarNode.getChildren()) {
            if(!$isTabGroupBarItemNode(child)){
                continue
            }
            if(child.getBindTabNodeKey() === key){
                child.remove()
            }
        }
    }
}
//endregion
const onTabNodeCreated = (tabManager: TabManager, nodeMutationKey: NodeKey) => {
    tabManager.update(() => {
        const node = $getNodeByKey(nodeMutationKey)
        if(!node){
            return;
        }
        const parent = node.getParent()
        if(!$isTabGroupNode(parent)){
            return;
        }
        $updateTabGroupBarNode(parent)
        if(!$isTabNode(node)){
            return;
        }
        $activeTabNode(node)
    })
}
const onTabNodeDestroyed = (tabManager: TabManager, nodeMutationKey: NodeKey) => {
    tabManager.update(() => {
        const activeState = getActiveTabManagerState()
        for (const node of activeState._nodeMap.values()) {
            if($isTabGroupBarItemNode(node) && node.getBindTabNodeKey() === nodeMutationKey){
                node.remove()
                return
            }
        }
    })
}

export function registerTabNodeMutation(
    tabManager: TabManager
): () => void{
    const registeredTabNodes = tabManager.getRegisteredTabNodes()
    const unregisterFunctions:(() => void)[] = []
    /*for (const klassObj of registeredTabNodes.values()) {
        unregisterFunctions.push(
            tabManager.registerMutationListener(klassObj.klass, nodeMutations => {
                console.log("TabNodes like nodeMutations", nodeMutations);
                for (const nodeMutationKey of nodeMutations.keys()) {
                    if(nodeMutations.get(nodeMutationKey) === 'created'){
                        onTabNodeCreated(tabManager, nodeMutationKey)
                    }
                    if(nodeMutations.get(nodeMutationKey) === 'destroyed'){
                        onTabNodeDestroyed(tabManager, nodeMutationKey)
                    }
                }
            })
        )
    }*/
    return () => {
        for (const unregisterFunction of unregisterFunctions) {
            unregisterFunction()
        }
    }
}


//region 对tabGroup的响应
const onTabGroupNodeUpdated = (tabManager: TabManager, nodeMutationKey: NodeKey) => {
    tabManager.update(() => {
        const node = $getNodeByKey(nodeMutationKey)
        if(!node || !$isTabGroupNode(node)){
            return
        }
        $updateTabGroupBarNode(node)
    }, {
        tag: TabGroupNodeUpdateTag
    })
}

//endregion
// TODO 为什么三个tabGroupNode，在第一个tabGroupNode中的两个tabNode其中的一个挪到第二个tabGroupNode的时候，为什么第三个tabGroupNode也会触发updated？

export function $registerCloseTabCommand(
    nodeKey: NodeKey
): boolean {
    const node = $getNodeByKey(nodeKey)
    if(!$isTabNode(node)){
        return false
    }
    if(!node.getActive()){
        node?.remove()
        return false
    }
    let tabGroupNode
    try {
        tabGroupNode = node?.getParent() as TabGroupNode | undefined
        if (!$isTabGroupNode(tabGroupNode)) {
            return false
        }
        $activeLastTabAfterDelete(tabGroupNode, nodeKey)
    } finally {
        node?.remove()
        if(tabGroupNode){
            $updateTabGroupBarNode(tabGroupNode)
        }
    }

    return false
}

export function $activeLastTabAfterDelete(tabGroupNode: TabGroupNode, deleteNodeKey: NodeKey): boolean{
    const tabNodes = tabGroupNode.getChildren().filter((c) => $isTabNode(c))
    if(tabNodes.length === 1){
        return false
    }
    let deleteIndex = -1
    for (let i = 0; i < tabNodes.length; i++) {
        if(tabNodes[i].getKey() === deleteNodeKey){
            deleteIndex = i
        }
    }
    if(deleteIndex === -1){
        return false
    }
    if(deleteIndex === 0){
        $activeTabNodeByKey(tabNodes[1].getKey())
    }else{
        $activeTabNodeByKey(tabNodes[deleteIndex - 1].getKey())
    }
    return false
}

export function $activeLastTab(tabGroupNode: TabGroupNode){
    const tabNodes = tabGroupNode.getChildren().filter((c) => $isTabNode(c))
    if(tabNodes.length === 0){
        return false
    }
    $activeTabNodeByKey(tabNodes[tabNodes.length - 1].getKey())
}

export function $registerAddTabCommand(
    {parentTabGroupNodeKey, name}: {
        parentTabGroupNodeKey: NodeKey,
        name: string | undefined
    }
): boolean {
    const node = $getNodeByKey(parentTabGroupNodeKey)
    if(!$isTabGroupNode(node)){
        return false
    }
    // const tabNode = $createTabNode(name, undefined)
    // node.append(tabNode)
    return false
}

export function $registerActiveTabCommand(
    {tabNodeKey}: {
        tabNodeKey: NodeKey,
    }): boolean {
    $activeTabNodeByKey(tabNodeKey)
    return false
}

export function $registerActiveTabGroupCommand(nodeKey: NodeKey): boolean {
    $activeTabGroupNodeByKey(nodeKey)
    return false
}

export function $findTabGroupBarItemNodeByTabNodeKey(tabNodeKey: NodeKey): TabGroupBarItemNode | undefined{
    const tabNode = $getNodeByKey(tabNodeKey)
    const parent = tabNode?.getParent()
    if(!$isTabGroupNode(parent)){
        return
    }
    const tabGroupBarNodes = parent.getChildren().filter((c) => $isTabGroupBarNode(c)) as TabGroupBarNode[]
    if(tabGroupBarNodes.length === 0){
        return
    }
    const tabGroupBarItemNodes = tabGroupBarNodes[0].getChildren().filter((c) =>
        $isTabGroupBarItemNode(c) && c.getBindTabNodeKey() === tabNodeKey)  as TabGroupBarItemNode[]
    if(tabGroupBarItemNodes.length !== 1){
        return
    }
    return tabGroupBarItemNodes[0]

}





