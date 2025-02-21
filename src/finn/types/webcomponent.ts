export type View = 'dashboard' | 'mutate'

export type Webcomponent = {
  integrationId: string
  tenant: string
  token: string
  view: View
  id: string
  project: string
}
