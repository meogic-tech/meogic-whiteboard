import {NodeKey} from "@meogic/tab-manager";

export type TreeItem = {
    key?: NodeKey,
    type?: string,
    deep?: number,
    detail?: string,
    children: TreeItem[]
}
