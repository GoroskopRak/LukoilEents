import React, { FormEvent, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import  './styles.scss'
import LogoSvg from './logo';
import RedFrame from './RedFrame';
import { useAppDispatch } from '../../app/hooks';
import { fetch2, fetchLoginAppBasic } from '../../services/loginSlice';

interface IForm {
	username: string
	password: string
}

const LoginPage = () => {
	const [login, setLogin] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [allowEntry, setAllowEntry] = useState<boolean | undefined>(undefined)
	const form = useRef<HTMLFormElement>()
	const dispatch = useAppDispatch()

	const onLogin = (e:FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setTimeout(() => {!!allowEntry && setAllowEntry(false)},1000)
		dispatch(fetchLoginAppBasic({login,password, onSuccess(data) {
			setAllowEntry(true)
		}}))
		// dispatch(fetch2({login,password}))
	}

	return (
		<div className='flex login-container'>
			<div className='half-container'>
				<LogoSvg/>
				<h2>Вход в систему</h2>
				<p>Введите логин и пароль для осуществления входа в систему enrsoft</p>
				{/* <form action="https://dev.enrsoft.ru/login.html" method="post"> */}
				<form className='flex-column' onSubmit={(e) => onLogin(e)}>
					<input placeholder='логин' name='login' type="text" onChange={(e) => setLogin(e?.target?.value)}/>
					<input placeholder='пароль' name='password' type="password" autoComplete="on" onChange={(e) => setPassword(e?.target?.value)}/>
					<button type='submit'>Войти</button>
				</form>
				{allowEntry === true && 'Правильные логин или пароль'}
				{allowEntry === false && 
				<div className=''>Неправильные логин или пароль</div>
				
				}
			</div>
			<div className='half-container red'>
				<RedFrame/>
			</div>
		</div>
	)
}

export default LoginPage
