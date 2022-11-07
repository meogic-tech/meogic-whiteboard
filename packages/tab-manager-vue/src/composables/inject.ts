import type { InjectionKey } from 'vue'
import type { TabManager } from '@meogic/tab-manager'

export const tabManagerKey: InjectionKey<TabManager> = Symbol('Tab Manager')
