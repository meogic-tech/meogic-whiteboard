import { $getPointInWhiteboardFromEventPoint, $getViewportNode, Whiteboard } from "../";

/**
 * 这个方法放在这是因为shared/environment只能在rollup打包的包里引用
 * @param event
 * @param whiteboard
 */
export const onWheel = (event: WheelEvent, whiteboard: Whiteboard) => {
  // 删除根据平台限制ctrlKey和metaKey，因为苹果下用zoom手势会带上ctrlKey
  whiteboard.update(() => {
    const viewportNode = $getViewportNode()
    if(!viewportNode){
      console.warn('not found viewport node');
      return;
    }
    const oldZoom = viewportNode.getLatest()._zoom
    // @ts-ignore
    let newZoom = oldZoom + (event.wheelDeltaY > 0 ? 0.1 : -0.1);
    newZoom = Math.max(0.1, newZoom)
    newZoom = Math.round(newZoom * 100) / 100
    const zoomRatio = newZoom - oldZoom
    const point = $getPointInWhiteboardFromEventPoint(event.x, event.y)
    if(!point){
      return;
    }
    const oldX = viewportNode.getLatest()._offsetX
    const oldY = viewportNode.getLatest()._offsetY
    const deltaX = point.x * zoomRatio
    const deltaY = point.y * zoomRatio
    viewportNode.getWritable()._zoom = newZoom
    let offsetX = -deltaX + oldX
    offsetX = Math.round(offsetX * 100) / 100
    let offsetY = -deltaY + oldY
    offsetY = Math.round(offsetY * 100) / 100
    viewportNode.getWritable()._offsetX = offsetX
    viewportNode.getWritable()._offsetY = offsetY
  })
}
