export type View = 'dashboard' | 'mutate'

export type Webcomponent = {
  labels: Record<string, string> // string
  locale: string
  currency: string
}
