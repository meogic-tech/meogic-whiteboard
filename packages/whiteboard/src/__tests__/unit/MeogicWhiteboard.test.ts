import {createTestWhiteboard} from "../utils";
import {
  $createContainerNode,
  $createViewportNode,
  $getRoot, $getViewportNode, CLICK_COMMAND, REDO_COMMAND, SAVE_SNAPSHOT_HISTORY_COMMAND, UNDO_COMMAND
} from "@meogic/whiteboard";
import {useHistory} from "@meogic/whiteboard-vue";

describe('MeogicWhiteboard tests', () => {
  it('Should handle nested updates in the correct sequence', async () => {
    const rootElement = document.createElement('div');
    const whiteboard = createTestWhiteboard({
    })
    whiteboard.setRootElement(rootElement)
    let log: Array<string> = [];

    useHistory(whiteboard)

    whiteboard.update(() => {
      const root = $getRoot();
      const containerNode = $createContainerNode()
      const viewportNode = $createViewportNode(0, 0, 1)

      root.append(
        containerNode
          .append(
            viewportNode
          )
      )
    }, {
      tag: 'history-merge'
    });
    await Promise.resolve().then();

    whiteboard.registerCommand(CLICK_COMMAND, () => {
      log.push('B1');
      console.log('开始层3更新')
      const viewportNode = $getViewportNode()
      viewportNode.setOffsetX(100)
      return false
    }, 1)

    await new Promise<void>((resolve) => {
      whiteboard.update(() => {
        whiteboard.dispatchCommand(SAVE_SNAPSHOT_HISTORY_COMMAND, null)
        console.log('开始层1更新')
        whiteboard.update(
          () => {
            console.log('开始层2更新')
            log.push('A1');
            const viewportNode = $getViewportNode()
            viewportNode.setZoom(2)
            // To enforce the update
            setTimeout(() => {
              whiteboard.update(() => {
                console.log('开始层3更新')
                const viewportNode = $getViewportNode()
                viewportNode.setOffsetX(100)
              }, {onUpdate() {
                  resolve()
                }})
            })
          },
        );
      })
    })

    console.log('开始验证')

    function getZoomAndOffsetX() {
      return whiteboard.getWhiteboardState().read(() => {
        return {
          offsetX: $getViewportNode().getOffsetX(),
          zoom: $getViewportNode().getZoom()
        }
      })
    }

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });

    whiteboard.dispatchCommand(UNDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 1
    });

    whiteboard.dispatchCommand(REDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });
  });

  it('Should handle nested updates in the correct sequence2', async () => {
    const rootElement = document.createElement('div');
    const whiteboard = createTestWhiteboard({
    })
    whiteboard.setRootElement(rootElement)
    let log: Array<string> = [];

    useHistory(whiteboard)

    whiteboard.update(() => {
      const root = $getRoot();
      const containerNode = $createContainerNode()
      const viewportNode = $createViewportNode(0, 0, 1)

      root.append(
        containerNode
          .append(
            viewportNode
          )
      )
    }, {
      tag: 'history-merge'
    });
    await Promise.resolve().then();

    whiteboard.registerCommand(CLICK_COMMAND, () => {
      log.push('B1');
      console.log('开始层3更新')
      const viewportNode = $getViewportNode()
      viewportNode.setOffsetX(100)
      return false
    }, 1)

    await new Promise<void>((resolve) => {
      whiteboard.update(() => {
        console.log('开始层1更新')
        whiteboard.update(
          () => {
            console.log('开始层2更新')
            log.push('A1');
            const viewportNode = $getViewportNode()
            viewportNode.setZoom(2)
            // To enforce the update
            setTimeout(() => {
              whiteboard.dispatchCommand(SAVE_SNAPSHOT_HISTORY_COMMAND, null)
              whiteboard.update(() => {
                console.log('开始层3更新')
                const viewportNode = $getViewportNode()
                viewportNode.setOffsetX(100)
              }, {onUpdate() {
                  resolve()
                }})
            })
          },
        );
      })
    })

    console.log('开始验证')

    function getZoomAndOffsetX() {
      return whiteboard.getWhiteboardState().read(() => {
        return {
          offsetX: $getViewportNode().getOffsetX(),
          zoom: $getViewportNode().getZoom()
        }
      })
    }

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });

    // 由于之前没有SAVE_SNAPSHOT_HISTORY_COMMAND，所以不能再回退了
    whiteboard.dispatchCommand(UNDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 2
    });

    whiteboard.dispatchCommand(UNDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 2
    });

    whiteboard.dispatchCommand(REDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });
  });

  it('Should handle nested updates in the correct sequence without add-history-but-ignore-history', async () => {
    const rootElement = document.createElement('div');
    const whiteboard = createTestWhiteboard({
    })
    whiteboard.setRootElement(rootElement)
    let log: Array<string> = [];

    useHistory(whiteboard)

    whiteboard.update(() => {
      const root = $getRoot();
      const containerNode = $createContainerNode()
      const viewportNode = $createViewportNode(0, 0, 1)

      root.append(
        containerNode
          .append(
            viewportNode
          )
      )
    }, {
      tag: 'history-merge'
    });
    await Promise.resolve().then();

    whiteboard.registerCommand(CLICK_COMMAND, () => {
      log.push('B1');
      console.log('开始层3更新')
      const viewportNode = $getViewportNode()
      viewportNode.setOffsetX(100)
      return false
    }, 1)

    await new Promise<void>((resolve) => {
      whiteboard.update(() => {
        console.log('开始层1更新')
        whiteboard.update(
          () => {
            console.log('开始层2更新')
            log.push('A1');
            const viewportNode = $getViewportNode()
            viewportNode.setZoom(2)
            // To enforce the update
            setTimeout(() => {
              whiteboard.update(() => {
                console.log('开始层3更新')
                const viewportNode = $getViewportNode()
                viewportNode.setOffsetX(100)
              }, {tag: "add-history", onUpdate() {
                  resolve()
                }})
            })
          },
          {
            tag: 'add-history'
          },
        );
      })
    })

    console.log('开始验证')

    function getZoomAndOffsetX() {
      return whiteboard.getWhiteboardState().read(() => {
        return {
          offsetX: $getViewportNode().getOffsetX(),
          zoom: $getViewportNode().getZoom()
        }
      })
    }

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });

    whiteboard.dispatchCommand(UNDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 2
    });

    whiteboard.dispatchCommand(UNDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 1
    });

    whiteboard.dispatchCommand(REDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 0,
      zoom: 2
    });

    whiteboard.dispatchCommand(REDO_COMMAND, null)

    expect(getZoomAndOffsetX()).toStrictEqual({
      offsetX: 100,
      zoom: 2
    });


  });
});
