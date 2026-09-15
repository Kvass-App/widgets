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

function submitToEndpoint(url, payload, options = {}) {
  const { timeout = 15000 } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok)
        throw new Error(`Submit endpoint failed, statusCode: ${res?.status}`)
      return res.json().catch(() => ({}))
    })
    .finally(() => clearTimeout(timer))
}

export { createFormSubmit, submitToEndpoint }
