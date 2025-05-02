function createLead(url, data, projects, defaultAssignees) {
  if (projects && projects instanceof Array && projects.length) {
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
  }

  if (!projects?.length && defaultAssignees?.length) {
    return createContact(
      url,
      { ...data.contact, assignees: defaultAssignees },
      data.comment,
    )
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

function createContact(url, data, comment) {
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

function getProjects(url) {
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
    .then((res) => res.data.Projects.filter((d) => d.isPublished))
}

function createFormSubmit(url, formId, data) {
  // if (!projects?.length && defaultAssignees?.length) {
  //   return createContact(
  //     url,
  //     { ...data.contact, assignees: defaultAssignees },
  //     data.comment,
  //   )
  // }

  return fetch(`${url}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
                  mutation ($data: FormSubmitInput!) {
                      FormSubmitCreate(data: $data) {
                          id
                      }
                  }
              `,
      variables: { data: { form: formId, data } },
    }),
  }).then((res) => {
    console.log(res)
    if (!res.ok)
      throw new Error(`FormSubmit failed, statusCode: ${res?.status}`)
  })
}

export { createLead, createContact, createFormSubmit }
