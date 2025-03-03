import { inject } from 'vue'
import { PropsInjectionKey } from '../keys'
import { type Webcomponent } from '../types/webcomponent'
import { type Ad, Unit } from '../types/ad'
import fetch from './fetch'
import SSE from '../utils/sse'

import { useCurrentElement } from '@vueuse/core'
type CurrentElementType = ReturnType<typeof useCurrentElement>

export interface FieldsBase {
  fields: Record<string, any>
  rules: Record<string, string>
  labels: Record<string, string>
}

export interface Fields extends FieldsBase {
  units: FieldsBase[]
}

export function useAPI(element?: CurrentElementType) {
  const props = inject<Webcomponent>(PropsInjectionKey) as Webcomponent

  const getUrl = (callback: string) =>
    new URL(
      `${props.tenant}/api/integration/${props.integrationId}/callbacks/${callback}`,
    )

  const getAds = <T extends string | undefined = undefined>(
    id?: T,
  ): Promise<T extends string ? Ad : Ad[]> => {
    const url = getUrl('data')

    if (id) url.searchParams.append('id', id)

    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        authorization: `Bearer ${props.token}`,
      },
    }).then((res) => res.json())
  }

  const getUnits = (): Promise<Unit[]> => {
    const url = getUrl('units')

    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        authorization: `Bearer ${props.token}`,
      },
    }).then((res) => res.json())
  }

  const fields = (data: Ad): Promise<Fields> => {
    const url = getUrl('fields')

    return fetch(url.toString(), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${props.token}`,
      },
      body: JSON.stringify({
        type: data.type,
        units: data.units.map((v) => v.id),
      }),
    }).then((res) => res.json())
  }

  const remove = (id: string) => {
    const url = getUrl('unpublish')

    url.searchParams.append('id', id)

    return fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${props.token}`,
      },
    }).catch((err) => {
      console.error(err)
      throw err
    })
  }

  const unpublish = (id: string) => {
    const url = getUrl('unpublish')

    url.searchParams.append('id', id)

    return fetch(url.toString(), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${props.token}`,
      },
    })
  }

  const publish = async (
    data,
    options: { preview?: boolean; publish?: boolean } = {},
  ) => {
    const { preview = false, publish = true } = options

    const url = getUrl('publish')

    const response = await fetch(url.toString(), {
      method: 'POST',
      cache: 'no-cache',
      keepalive: true,
      headers: {
        Authorization: `Bearer ${props.token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        data,
        preview,
        publish,
      }),
    })

    return SSE(response)
  }

  const navigateView = (view: 'mutate' | 'dashboard', id?: string) => {
    const target = getUrl(view)

    target.searchParams.append('token', props.token)
    target.searchParams.append('project', props.project)
    if (id) target.searchParams.append('id', id)

    //@ts-ignore
    element.value.dispatchEvent(
      new CustomEvent('action', {
        detail: {
          type: 'navigate',
          value: {
            name: 'form',
            query: {
              target: target.toString(),
            },
          },
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  const navigateProjectStep = (step: string) => {
    //@ts-ignore
    element.value.dispatchEvent(
      new CustomEvent('action', {
        detail: {
          type: 'navigate',
          value: {
            name: 'project-edit',
            params: {
              id: props.project,
              step: step,
            },
          },
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  return {
    getAds,
    navigateView,
    remove,
    publish,
    unpublish,
    navigateProjectStep,
    getUnits,
    fields,
  }
}
