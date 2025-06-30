function createFormSubmit(url, formId, data) {
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

export { createFormSubmit }
