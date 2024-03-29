/* eslint-disable no-restricted-globals */
import axios from 'axios';

export const urlApi = location.hostname === 'localhost'
	? 'https://dev.enrsoft.ru'
	: `${location.origin}/api`

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
