export default function SSE(response: Response) {
  const decoder = new TextDecoder()
  const listeners: any[] = []

  const Parse = (chunk: any) => {
    return decoder
      .decode(chunk)
      .split('\n')
      .map((v) => {
        if (!v) return
        return JSON.parse(v.replace('data: ', ''))
      })
      .filter(Boolean)
  }

  //@ts-ignore
  const reader = response.body.getReader()

  const emit = (event: string, payload?: any) =>
    listeners
      .filter((l) => l.event === event)
      .forEach((l) => l.callback(payload))

  //@ts-ignore
  reader.read().then(function Consume({ done, value }) {
    if (done) return emit('finished')

    Parse(value).forEach((e) => emit(e.event, e.payload))

    return reader.read().then(Consume)
  })

  return {
    on: (event: string, callback: (...args: any[]) => void): void => {
      listeners.push({ event, callback })
    },
    cancel: () => {
      reader.cancel()
    },
  }
}
