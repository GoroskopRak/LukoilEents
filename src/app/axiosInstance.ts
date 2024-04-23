/* eslint-disable no-restricted-globals */
import axios from 'axios';

export const urlApi = location.hostname === 'localhost'
	? 'https://dev.enrsoft.ru'
	: 'https://lvnp.enrsoft.ru'

axios.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => Promise.reject(error)
)

export const BaseInstanse = axios.create({
	withCredentials: true,
	baseURL: `${urlApi}`,
	headers: { "Content-Type": "multipart/form-data"}
})

export const RestInstanse = axios.create({
	withCredentials: true,
	baseURL: `${urlApi}/rest`,
	// headers: { "Content-Type": "multipart/form-data","Access-Control-Allow-Origin": "*",
    // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS", }
})
