import {
    $getNearestNodeFromDOMNode,
    $getNearestNodeTypeFromDOMNode,
    $getNodeByKey, getCachedClassNameArray
} from "@meogic/tab-manager";
import {
    $activeLastTab,
    $activeLastTabAfterDelete,
    $activeTabGroupNode,
    $activeTabNode,
    $isTabGroupBarItemNode, $updateTabGroupBarNode,
    TabGroupBarItemNode
} from "@meogic/tab-manager-tab-group-bar";
import {getActiveTabManager} from "@meogic/tab-manager";
import {ACTIVE_TAB_COMMAND, TabGroupNode, TabNode} from "@meogic/tab-manager";
import {$isTabGroupNode} from "@meogic/tab-manager";
import {$isTabNode} from "@meogic/tab-manager";

let activeTabGroupBarItemNode: TabGroupBarItemNode | undefined
let activeHtmlElement: HTMLElement | undefined
let xOffset = 0
let yOffset = 0
let currentTabGroupNode: TabGroupNode | undefined
let currentOverTabGroupNode: TabGroupNode | undefined
let coverHtmlElement: HTMLElement | undefined

//region 事件响应
export function $registerMouseDown(mouseEvent: MouseEvent): boolean {
    const tagName = (mouseEvent.target as HTMLElement).tagName
    const isClosestButton = (mouseEvent.target as HTMLElement).closest('button')
    if(tagName === 'BUTTON' ||
        isClosestButton
    ){
        console.debug('当前点击的是button或者近似button，就不予处理当前事件，避免它对应的click事件不触发', 'tagName', tagName, 'isClosestButton', isClosestButton)
        return false
    }
    // 找到当前的标签页node
    const tabGroupBarItemNode = $getNearestNodeTypeFromDOMNode(mouseEvent.target as Node, TabGroupBarItemNode)
    if(!tabGroupBarItemNode || !$isTabGroupBarItemNode(tabGroupBarItemNode)){
        return false
    }
    activeTabGroupBarItemNode = tabGroupBarItemNode

    // 复制标签页的dom
    const tabManager = getActiveTabManager()
    const itemNode = tabManager.getElementByKey(activeTabGroupBarItemNode.getKey())
    if(!itemNode) {
        return false
    }
    xOffset = itemNode.getBoundingClientRect().left - mouseEvent.x
    yOffset = itemNode.getBoundingClientRect().top - mouseEvent.y
    activeHtmlElement = itemNode.cloneNode(true) as HTMLElement
    activeHtmlElement.style.position = 'absolute'
    activeHtmlElement.style.height = itemNode.getBoundingClientRect().height + 'px'
    activeHtmlElement.style.width = itemNode.getBoundingClientRect().width + 'px'
    activeHtmlElement.style.left = mouseEvent.x + xOffset + 'px'
    activeHtmlElement.style.top = mouseEvent.y + yOffset + 'px'
    activeHtmlElement.style.zIndex = '3'
    const classNames: string[] = getCachedClassNameArray(tabManager._config.theme, 'tab-group-bar-item-draggable')
    if( classNames !== undefined){
        const domClassList = activeHtmlElement.classList
        domClassList.add(...classNames)
    }
    tabManager.getRootElement()?.append(activeHtmlElement)

    // 找到标签页对应的tabGroupNode
    const tabNode = $getNodeByKey(activeTabGroupBarItemNode.getBindTabNodeKey())
    const parent = tabNode?.getParent()
    if(!parent || !$isTabGroupNode(parent)){
        console.debug('不是tabGroupNode')
        return false
    }
    currentTabGroupNode = parent
    return true
}

export function $registerMouseMove(mouseEvent: MouseEvent): boolean {
    if(!activeTabGroupBarItemNode || !activeHtmlElement){
        return false
    }
    // console.log('mouseMove')
    // console.log("mouseMove x", mouseEvent.x, "y", mouseEvent.y);
    activeHtmlElement.style.left = mouseEvent.x + xOffset + 'px'
    activeHtmlElement.style.top = mouseEvent.y + yOffset + 'px'

    const overTabGroupNode =  $overTabGroupNode(mouseEvent)
    if(!overTabGroupNode || overTabGroupNode.getKey() === currentTabGroupNode?.getKey()){
        return false
    }
    $addCoverOnTabGroupNode(mouseEvent, overTabGroupNode)
    return true
}

export function $registerMouseUp(mouseEvent: MouseEvent): boolean {
    if(activeTabGroupBarItemNode === undefined){
        return false
    }
    const tabNode = $getNodeByKey(activeTabGroupBarItemNode.getBindTabNodeKey())
    if(!tabNode || !$isTabNode(tabNode)){
        return false
    }
    $moveTabNode(tabNode)
    currentOverTabGroupNode?.setActive(true)
    activeTabGroupBarItemNode = undefined
    activeHtmlElement?.remove()
    activeHtmlElement = undefined
    coverHtmlElement?.remove()
    coverHtmlElement = undefined
    currentOverTabGroupNode = undefined
    return true
}
//endregion

//region 移动中的处理
export function $overTabGroupNode(mouseEvent: MouseEvent): TabGroupNode | undefined {
    const elements = document.elementsFromPoint(mouseEvent.x, mouseEvent.y)
    let currentTabGroupNode: TabGroupNode | undefined = undefined
    for (const element of elements) {
        const node = $getNearestNodeFromDOMNode(element)
        if($isTabGroupNode(node)){
            currentTabGroupNode = node
            break
        }
    }
    return currentTabGroupNode
}

/**
 * 给tabGroupNode上添加蒙版
 * @param mouseEvent
 */
export function $addCoverOnTabGroupNode(mouseEvent: MouseEvent, targetTabGroupNode: TabGroupNode){
    const tabManager = getActiveTabManager()
    const element = tabManager.getElementByKey(targetTabGroupNode.getKey())
    if(coverHtmlElement && targetTabGroupNode.getKey() === currentOverTabGroupNode?.getKey()){
        return
    }
    currentOverTabGroupNode = targetTabGroupNode
    coverHtmlElement?.remove()
    coverHtmlElement = document.createElement('div')
    const classNames: string[] = getCachedClassNameArray(tabManager._config.theme, 'tab-group-cover')
    if( classNames !== undefined){
        const domClassList = coverHtmlElement.classList
        domClassList.add(...classNames)
    }
    element?.append(coverHtmlElement)

}
//endregion

//region 移动后的处理
/**
 * 将当前移动的tabNode转移到当前悬浮
 */
export function $moveTabNode(tabNode: TabNode<unknown>){
    if(!currentOverTabGroupNode){
        return
    }
    tabNode.remove()
    currentOverTabGroupNode.append(tabNode)
    $activeTabGroupNode(currentOverTabGroupNode)
    if(currentTabGroupNode){
        $activeLastTab(currentTabGroupNode)
        $updateTabGroupBarNode(currentTabGroupNode)
    }
    $updateTabGroupBarNode(currentOverTabGroupNode)
    $activeTabNode(tabNode)
}
//endregion
