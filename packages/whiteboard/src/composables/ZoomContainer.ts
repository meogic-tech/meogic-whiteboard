import { IS_APPLE } from "shared/environment";
import { $getPointInWhiteboardFromEventPoint, $getViewportNode, Whiteboard } from "@meogic/whiteboard";

/**
 * 这个方法放在这是因为shared/environment只能在rollup打包的包里引用
 * @param event
 * @param whiteboard
 */
export const onWheel = (event: WheelEvent, whiteboard: Whiteboard) => {
  if(IS_APPLE && !event.metaKey){
    return
  }
  if(!IS_APPLE && !event.ctrlKey){
    return
  }
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
    viewportNode.getWritable()._offsetX = -deltaX + oldX
    viewportNode.getWritable()._offsetY = -deltaY + oldY
  })
}
