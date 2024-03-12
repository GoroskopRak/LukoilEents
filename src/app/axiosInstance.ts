import axios from 'axios'

export const urlApi ='https://dev.enrsoft.ru'

axios.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => Promise.reject(error)
)

export const BaseInstanse = axios.create({
	baseURL: `${urlApi}`,
	headers: { "Content-Type": "multipart/form-data"}
})

export const RestInstanse = axios.create({
	baseURL: `${urlApi}/rest`,
	// headers: { "Content-Type": "multipart/form-data","Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS", }
})
