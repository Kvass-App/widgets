import type { Reference, Project, Contact } from './types'

interface CreateLeadData {
  contact: Contact
  comment?: string | null
  project?: string
  references: Reference[]
}

interface CreateContactData extends Contact {
  assignees: string[]
}

export function createLead(
  url: string,
  data: CreateLeadData,
  projects?: string[],
  defaultAssignees?: string[]
): Promise<any> {
  if (projects && projects instanceof Array && projects.length)
    return Promise.all(
      projects.map((p) => {
        let projectRef = { onModel: 'Project', ref: p }
        return createLead(url, {
          ...data,
          project: p,
          references: [projectRef, ...data.references],
        })
      }),
    )

  if (!projects?.length) {
    if (!defaultAssignees?.length) {
      return Promise.reject(new Error('No default assignees defined'))
    }
    return createContact(url, { ...data.contact, assignees: defaultAssignees }, data.comment)
  }

  return fetch(`${url}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
				mutation ($data: LeadCreate!) {
					LeadCreate(data: $data) {
						id
					}
				}
			`,
      variables: { data },
    }),
  }).then((res) => res.json())
}

export function createContact(
  url: string,
  data: CreateContactData,
  comment?: string | undefined | null
): Promise<{ id: string }> {
  return fetch(`${url}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
				mutation ($data: ContactInput!, $comment: String) {
					ContactCreate(data: $data, comment: $comment) {
						id
					}
				}
			`,
      variables: { data, comment },
    }),
  }).then((res) => res.json())
}

export function getProjects(url: string): Promise<Project[]> {
  return fetch(`${url}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
				query {
					Projects {
						id
						name
						isPublished
					}
				}
			`,
    }),
  })
    .then((res) => res.json())
    .then((res) => res.data.Projects.filter((d: Project) => d.isPublished))
}
