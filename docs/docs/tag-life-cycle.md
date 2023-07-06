# tag更新标签的生命周期

## 在哪存储？
在whiteboard对象中


## 设置
外部设置的地方
```javascript
whiteboard.update(() => {
    
}, {
    tag: ''
})
```
## 读取
commitPendingUpdates()函数中
```javascript
const tags = whiteboard._updateTags;
```

## 清除
beginUpdate()函数中
只有在不更新和whiteboard是被克隆的情况下才会clear
```javascript
if (shouldUpdate) {
    commitPendingUpdates(whiteboard);
} else {
    if (whiteboardStateWasCloned) {
        updateTags.clear();
        whiteboard._deferred = [];
        whiteboard._pendingWhiteboardState = null;
    }
}
```

## 案例解析
如果是如下的代码，那么tag的情况如下
```javascript
whiteboard.registerCommand(CLICK_COMMAND, () => {
    console.log('开始CLICK_COMMAND更新')
    return false
}, 1)

whiteboard.update(
    () => {
        console.log('开始外层更新')
        $getRoot().markDirty()
        whiteboard.dispatchCommand(CLICK_COMMAND, null)
    },
    {
        tag: 'add-history'
    },
);
```
以下是输出结果
```text
```
