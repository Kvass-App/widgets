export type Reference = {
	onModel: string
	ref: string
}

export type Project = {
	id: string
	name: string
	isPublished: boolean
}

export type Contact = {
	name: string | null
	email: string | null
	phone?: string | null
	upsell: boolean
	tags?: string[]
}