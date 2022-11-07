import {getNodeFromDOMNode, WindowNode, getActiveTabManager} from "@meogic/tab-manager";
import {$isResizableTabGroupNode, ResizableTabGroupNode} from "./ResizableTabGroupNode";

let isMouseDownResizeHandle = false
let startX: number
let tabGroupNode: ResizableTabGroupNode
// 最高100
let startPercent: number
let startWidth: number
let nextStartWidth: number

const setIsMouseDownResizeHandle = (value: boolean) => {
    isMouseDownResizeHandle = value
}

export function $registerMouseDown(mouseEvent: MouseEvent): boolean{
    if(!mouseEvent.target){
        return false
    }
    const isResizeHandle = (mouseEvent.target as HTMLElement).getAttribute('data-tab-manager-resize-handle')
    if(isResizeHandle !== 'true'){
        return false
    }
    const tabManager = getActiveTabManager()
    try {
        setIsMouseDownResizeHandle(true)
        startX = mouseEvent.x
        const tabGroupNodeDOM = (mouseEvent.target as HTMLElement).parentNode!
        const node = getNodeFromDOMNode(tabGroupNodeDOM)
        if (!node || !$isResizableTabGroupNode(node)) {
            setIsMouseDownResizeHandle(false)
            return false
        }
        tabGroupNode = node as ResizableTabGroupNode
        tabGroupNode.setResizing(true)
        startPercent = tabGroupNode.getPercent()
        startWidth = (tabGroupNodeDOM as HTMLElement).offsetWidth
        tabGroupNode.setWidth(startWidth)

        const nextTabGroupNode = tabGroupNode.getNextSibling<ResizableTabGroupNode>()
        if(nextTabGroupNode){
            nextTabGroupNode.setResizing(true)
            const element = tabManager.getElementByKey(nextTabGroupNode.getKey())
            if(!element){
                return false
            }
            nextStartWidth = (element as HTMLElement).offsetWidth
            nextTabGroupNode.setWidth(nextStartWidth)
        }
    } catch (e) {
        console.error(e)
        setIsMouseDownResizeHandle(false)
    }
    return true
}

export function $registerMouseMove(mouseEvent: MouseEvent): boolean{
    if(!isMouseDownResizeHandle){
        return false
    }
    mouseEvent.preventDefault()
    // 如果xDiff > 0 则是 向右， < 0是向左
    const xDiff = mouseEvent.x - startX
    const tabManager = getActiveTabManager()
    const windowNodeDom = tabManager.getElementByKey(tabGroupNode.getParent()!.getKey()!)
    if(!windowNodeDom){
        return false
    }
    const tabGroupNodeDOM = (mouseEvent.target as HTMLElement).parentNode!
    const node = getNodeFromDOMNode(tabGroupNodeDOM)
    if (!node || !$isResizableTabGroupNode(node)) {
        console.log('not found!')
    }
    tabGroupNode.setWidth(startWidth + xDiff)
    tabGroupNode.getNextSibling<ResizableTabGroupNode>()?.setWidth(nextStartWidth - xDiff)
    return true
}

export function $registerMouseUp(mouseEvent: MouseEvent): boolean{
    if(isMouseDownResizeHandle){
        setIsMouseDownResizeHandle(false)
        const tabManager = getActiveTabManager()
        if(!tabGroupNode.getParent<WindowNode>()?.getKey()){
            return false
        }
        const nextTabGroupNode = tabGroupNode.getNextSibling<ResizableTabGroupNode>()
        if(!nextTabGroupNode){
            return false
        }
        const totalWidth = tabManager.getElementByKey(tabGroupNode.getParent<WindowNode>()?.getKey()!)?.offsetWidth
        const width = tabManager.getElementByKey(tabGroupNode.getKey())?.offsetWidth
        if(!tabGroupNode.getNextSibling<ResizableTabGroupNode>()?.getKey()){
            return false
        }
        const nextWidth = tabManager.getElementByKey(tabGroupNode.getNextSibling<ResizableTabGroupNode>()?.getKey()!)?.offsetWidth
        if(!totalWidth || !width || !nextWidth){
            return false
        }
        tabGroupNode.setPercent(width / totalWidth * 100)
        nextTabGroupNode.setPercent(nextWidth / totalWidth * 100)
        tabGroupNode.setResizing(false)
        nextTabGroupNode.setResizing(false)
    }
    return false
}
