import { mergeDeepRight } from 'ramda'

export default async function (url: string, options = {}) {
  let defaultOptions = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }
  //@ts-ignore
  return fetch(url, mergeDeepRight(defaultOptions, options)).then((res) => {
    if (!res.ok) throw res
    return res
  })
}
