import { unref } from "vue";

export function useIconApi(url) {
	const apiUrl = unref(url)

	async function getCollections() {
		const res = await fetch(`${apiUrl}/collections`)
		if (!res.ok) throw new Error('Failed to fetch collections')

		const data = await res.json()
		return data
	}

	async function getIcons(options) {
		const { collection, limit, search } = options

		const params = new URLSearchParams({
			prefix: collection,
		})

		if (limit) {
			params.set('limit', limit)
		}

		if (search) {
			params.set('query', search)

			const res = await fetch(`${apiUrl}/search?${params.toString()}`)
			if (!res.ok) throw new Error('Failed to fetch icons')

			const data = await res.json()
			console.log(data)
			return data
		}

		const res = await fetch(`${apiUrl}/collection?${params.toString()}`)
		if (!res.ok) throw new Error('Failed to fetch icons')

		const data = await res.json()
		console.log(data)
		return data
	}

	return {
		getCollections,
		getIcons
	}
}