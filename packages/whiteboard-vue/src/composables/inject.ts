import type { InjectionKey } from 'vue'
import type { Whiteboard } from '@meogic/whiteboard'

export const whiteboardKey: InjectionKey<Whiteboard> = Symbol('Whiteboard')
