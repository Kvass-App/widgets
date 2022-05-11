function createLead(url, data) {
	fetch(`${url}/api/graphql`, {
		method: 'POST',
		body: JSON.stringify({
			query: `
				mutation ($data: LeadCreate!) {
					LeadCreate(data: $data) {
						id
					}
				}
			`,
			variables: {
				data: {
					...data
				}
			}
		})
	})
}

export {
	createLead
}