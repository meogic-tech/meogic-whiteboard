import {
    DecoratorNode, NodeKey,
    SerializedTabManagerNode, SerializedTabNode,
    Spread,
    TabManager,
    TabManagerConfig,
    TabManagerNode
} from "@meogic/tab-manager";
import {Component, h} from "vue";

import UserDetail from '../components/UserDetail.vue'
import {User} from "../model";
import {TabNode} from "@meogic/tab-manager";

export type SerializedUserTabNode = Spread<
    {
        user: User
    },
    SerializedTabNode
    >;

export class UserTabNode extends TabNode<Component> {
    static getType(): string {
        return 'user-tab';
    }
    private __user: User;
    static clone(node: UserTabNode): UserTabNode {
        const tabNode = new UserTabNode(node.__user, node.__active, node.__key)
        return tabNode;
    }


    constructor(user:User, active?: boolean, key?: NodeKey) {
        super(user.name, active, key);
        this.__user = user
    }

    //region getters
    getUser(): User {
        const self = this.getLatest()
        return self.__user
    }
    //endregion

    //region mutations
    setUser(value: User): this {
        const self = this.getWritable()
        self.__user = value
        return this
    }
    //endregion

    decorate(tabManager: TabManager, config: TabManagerConfig): Component {
        return h(
            UserDetail,
            this.exportJSON()
        );
    }
    static importJSON<T>(serializedNode: SerializedUserTabNode): UserTabNode {
        const node = $createUserTabNode(serializedNode.user, serializedNode.active);
        return node;
    }

    exportJSON(): SerializedUserTabNode {
        return {
            name: this.getName(),
            active: this.getActive(),
            user: this.getUser(),
            type: 'tab',
            version: 1,
        };
    }
}

export function $createUserTabNode(user: User, active?: boolean) {
    return new UserTabNode(user, active)
}

export function $isUserTabNode<T>(
    node: TabManagerNode | null | undefined,
): node is UserTabNode {
    return node instanceof UserTabNode;
}


