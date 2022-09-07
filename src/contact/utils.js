function Debounce(fn, wait = 300) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => { fn.apply(this, args) }, wait)
	}
}

const Capitalize = (value) => value.charAt(0).toUpperCase() + value.substring(1)

export {
	Debounce,
	Capitalize
}