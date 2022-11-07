import mitt from 'mitt'
import {User} from "../model";

type Events = {
    checkUserDetail: User
}

export const emitter = mitt<Events>()


