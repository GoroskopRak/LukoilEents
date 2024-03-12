import { BaseInstanse, RestInstanse } from '../app/axiosInstance'
import { RootState } from '@/app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { RequestState } from './requestTypes'

interface IInitialStateLogin {
	loginAndPass: {
		login: string
		password: string
	}
	allowEntry: boolean | undefined
}

export interface IFetchLoginAppBasic {
	login: string
	password: string
	onSuccess?: (data: any) => void
	onError?: () => void
}

// Небольшая документация.
// Накаждый запрос нужна basic auth
// Поэтмоу пробрасываем поля логин пароль каждый раз, который будут храниться...пока не придумала где
// Каждый раз запросы переадресовывают на html страницу, но мы это не ловим.
// Открывать приложение локально надо на 5500 порту, и в njinx писать на него разрешение, если вдруг ошибки вознакают в cors

export const fetchLoginAppBasic = createAsyncThunk<
	any,
	IFetchLoginAppBasic
>(
	'loginAppBasic',
	async ({ login, password, onSuccess = () => null, onError = () => null }) => {
		const response = await BaseInstanse.post(`/login.html`, {login, password},{
			auth: {
				  username: login,
				  password: password
			}
	  })
		const data: any = await response.data

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)

export const fetch2 = createAsyncThunk<
	any,
	IFetchLoginAppBasic
>(
	'22222222222222',
	async ({ login, password, onSuccess = () => null, onError = () => null }) => {
		const response = await RestInstanse.get(`/draft-supply-point-event`,{
			auth: {
				  username: login,
				  password: password
			}
	  })
		const data: any = await response.data

		if (response.status === 200) {
			onSuccess(data)
		} else {
			onError()
		}

		return data
	}
)


export const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: {
	loginAndPass: {
		login: "",
		password: "",
	}
  } as IInitialStateLogin,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchLoginAppBasic.fulfilled, (state, action) => {
      state.loginAndPass = {
		login: action.meta.arg.login,
		password: action.meta.arg.password
	}
    });
  },
});

export const selectLoginAndPass = (
	state: RootState,
) => state.Login.loginAndPass