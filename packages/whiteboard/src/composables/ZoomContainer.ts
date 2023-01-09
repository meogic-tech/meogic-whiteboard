import { $getPointInWhiteboardFromEventPoint, $getViewportNode, Whiteboard } from "../";

/**
 * 这个方法放在这是因为shared/environment只能在rollup打包的包里引用
 * 当viewport是matrix的时候适用
 * @param event
 * @param whiteboard
 * zoomIn
 * pointX: 0, pointY: 0
 * offsetX:450, offsetY: 300
 *
 * pointX: 350, pointY: 500
 * offsetX:100, offsetY: 200
 */
export const onWheel = (event: WheelEvent, whiteboard: Whiteboard) => {
  event.preventDefault()
  event.stopPropagation()
  if(!event.metaKey && !event.ctrlKey){
    return
  }
  // 删除根据平台限制ctrlKey和metaKey，因为苹果下用zoom手势会带上ctrlKey
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      console.warn('not found viewport node');
      return;
    }
    const oldZoom = viewportNode.getLatest()._zoom
    // @ts-ignore
    let newZoom = oldZoom + (event.wheelDeltaY > 0 ? 1 : -1);
    newZoom = Math.max(0.1, newZoom)
    newZoom = Math.round(newZoom * 100) / 100
    viewportNode.getWritable()._zoom = newZoom
    const root = whiteboard.getRootElement()
    if (!root) {
      return
    }
    /**
     * rect.width: 1800px
     */
    const rect = root.getBoundingClientRect()
    // 真实在图上的点
    const realX1 = event.x - rect.x
    /**
     * 真实到中心点的距离相等
     * | x1 - width / 2| / oldZoom = | x2 - width / 2| / newZoom
     * x2 = newZoom / oldZoom * (x1 - width / 2) + width / 2
     */
    // 真实在图上的点
    const realX2 = newZoom / oldZoom * (realX1 - rect.width / 2) + rect.width / 2
    const realDistanceX = realX1 - realX2

    const realY1 = event.y - rect.y
    const realY2 = newZoom / oldZoom * (realY1 - rect.height / 2) + rect.height / 2
    const realDistanceY = realY1 - realY2

    // oldX:0, oldY: 0
    const oldOffsetX = viewportNode.getOffsetX()
    const oldOffsetY = viewportNode.getOffsetY()
    /**
     * zoom: 1, offsetX: 0, offsetY: 0
     * 等价于zoom: 2, offsetX: 900, offsetY: 600
     * 等价于zoom: 3, offsetX: 1800, offsetY: 1200
     * 左上角的真实坐标都是0, 0
     */

    let offsetX = oldOffsetX * newZoom / oldZoom + realDistanceX
    offsetX = Math.round(offsetX * 100) / 100
    let offsetY = oldOffsetY * newZoom / oldZoom + realDistanceY
    offsetY = Math.round(offsetY * 100) / 100
    // console.table({realX1, realX2, 'rect.width': rect.width, realDistanceX, offsetX});
    viewportNode.getWritable()._offsetX = offsetX
    viewportNode.getWritable()._offsetY = offsetY
  })
}

/*
export const onWheel = (event: WheelEvent, whiteboard: Whiteboard) => {
  event.preventDefault()
  event.stopPropagation()
  if(!event.metaKey && !event.ctrlKey){
    return
  }
  // 删除根据平台限制ctrlKey和metaKey，因为苹果下用zoom手势会带上ctrlKey
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      console.warn('not found viewport node');
      return;
    }
    const oldZoom = viewportNode.getLatest()._zoom
    // @ts-ignore
    let newZoom = oldZoom + (event.wheelDeltaY > 0 ? 1 : -1);
    newZoom = Math.max(0.1, newZoom)
    newZoom = Math.round(newZoom * 100) / 100
    const zoomRatio = newZoom - oldZoom
    // point.x:350, point.y: 500
    const point = $getPointInWhiteboardFromEventPoint(event.x, event.y)
    if(!point){
      return;
    }
    // oldX:0, oldY: 0
    const oldX = viewportNode.getOffsetX()
    const oldY = viewportNode.getOffsetY()
    /!**
     * clientWidth: 1800px
     * clientHeight: 1200px
     *!/
    const dom = whiteboard.getElementByKey(viewportNode.getKey())
    if(!dom){
      return;
    }
    /!**
     * centerX: 900px
     * centerY: 600px
     *!/
    const centerX = oldX + dom.clientWidth / 2 / oldZoom
    const centerY = oldY + dom.clientHeight / 2 / oldZoom

    /!**
     * distanceToCenterX: -100px
     * distanceToCenterY: -300px
     *!/
    const distanceToCenterX = point.x - centerX / newZoom
    const distanceToCenterY = point.y - centerY / newZoom
    // console.table({
    //   clientWidth: dom?.clientWidth,
    //   scrollWidth: dom?.scrollWidth,
    //   offsetWidth: dom?.offsetWidth
    // })

    // offsetX:450, offsetY: 300
    let offsetX = point.x / newZoom - distanceToCenterX
    offsetX = Math.round(offsetX * 100) / 100
    let offsetY = point.y / newZoom - distanceToCenterY
    offsetY = Math.round(offsetY * 100) / 100
    console.table({pointX: point.x, pointY: point.y, distanceToCenterX, distanceToCenterY, offsetX, offsetY});

    // viewportNode.getWritable()._offsetX = offsetX
    // viewportNode.getWritable()._offsetY = offsetY
    viewportNode.getWritable()._zoom = newZoom
  })
}
*/
