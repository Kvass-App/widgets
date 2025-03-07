import type { InjectionKey, Ref } from 'vue'
import type { Webcomponent } from './types/webcomponent'

export const PropsInjectionKey = Symbol('props') as InjectionKey<Webcomponent>
