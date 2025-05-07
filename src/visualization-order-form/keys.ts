import type { InjectionKey, ComputedRef, Ref } from 'vue'
import type { getLabel, Props } from './types'

export const GetLabelInjectionKey = Symbol('getLabel') as InjectionKey<getLabel>
export const RootNodeInjectionKey = Symbol('rootNode') as InjectionKey<
  ComputedRef<Ref<ShadowRoot | null>>
>
export const PropsInjectionKey = Symbol(
  'PropsInjectionKey',
) as InjectionKey<Props>
