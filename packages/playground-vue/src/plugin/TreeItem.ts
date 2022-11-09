import {NodeKey} from "@meogic/whiteboard";

export type TreeItem = {
    key?: NodeKey,
    type?: string,
    deep?: number,
    detail?: string,
    children: TreeItem[]
}
