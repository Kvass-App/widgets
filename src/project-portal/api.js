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
					url
					isPublished
					media {
						cover {
							url
							type
						}
						gallery {
							url
							type
						}
					}
					address {
						street
						city
						county
						postcode
						location {
							coordinates
						}
					}
					stats {
						total
						sale
					}
					customFields(keys: ["project-intro", "project-type"])
				}
			}
			`,
    }),
  })
    .then((res) => res.json())
    .then((res) => res.data)
}

export { getProjects }
