function createLead(url, data, projects) {
	if (projects && projects instanceof Array && projects.length) return Promise.all(projects.map(p => {
		let projectRef = { onModel: 'Project', ref: p }
		return createLead(url, { ...data, project: p, references: [projectRef, ...data.references] })
	}))

	if (projects && !projects.length) {
		return createContact(url, data.contact, data.comment)
	}

	return fetch(`${url}/api/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: `
				mutation ($data: LeadCreate!) {
					LeadCreate(data: $data) {
						id
					}
				}
			`,
			variables: { data }
		})
	}).then(res => res.json())
}

function createContact(url, data, comment) {
	return fetch(`${url}/api/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: `
				mutation ($data: ContactInput!, $comment: String) {
					ContactCreate(data: $data, comment: $comment) {
						id
					}
				}
			`,
			variables: { data, comment }
		})
	}).then(res => res.json())
}

function getProjects(url) {
	return fetch(`${url}/api/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: `
				query {
					Projects {
						id
						name
					}
				}
			`
		})
	}).then(res => res.json())
}

export {
	createLead,
	createContact,
	getProjects
}