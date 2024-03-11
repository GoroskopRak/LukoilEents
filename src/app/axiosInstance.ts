import axios from 'axios'

export const urlApi ='https://dev.enrsoft.ru/'

axios.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => Promise.reject(error)
)

export const rest = axios.create({
	baseURL: `${urlApi}/rest`,
})
