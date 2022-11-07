import { inject } from 'vue'
import {tabManagerKey} from './inject'

export function useTabManager() {
  const tabManager = inject(tabManagerKey)

  if (!tabManager)
    throw new Error('<TabManagerComposer /> is required')

  return tabManager
}
