import { inject } from 'vue'
import {whiteboardKey} from './inject'

export function useWhiteboard() {
  const whiteboard = inject(whiteboardKey)

  if (!whiteboard)
    throw new Error('<WhiteboardComposer /> is required')

  return whiteboard
}
