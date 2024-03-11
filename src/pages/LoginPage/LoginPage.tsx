import React, { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import  './styles.scss'
import LogoSvg from './logo';
import RedFrame from './RedFrame';

interface IForm {
	username: string
	password: string
}

const LoginPage = () => {

	const onLogin = (e:FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		console.log('aaa')
	}

	return (
		<div className='flex login-container'>
			<div className='half-container'>
				<LogoSvg/>
				<h2>Вход в систему</h2>
				<p>Введите логин и пароль для осуществления входа в систему enrsoft</p>
				<form className='flex-column' onSubmit={(e) => onLogin(e)}>
					<input placeholder='логин'></input>
					<input placeholder='пароль'></input>
					<button type='submit'>Войти</button>
				</form>
			</div>
			<div className='half-container red'>
				<RedFrame/>
			</div>
		</div>
	)
}

export default LoginPage
