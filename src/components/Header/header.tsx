import React  from 'react'
import  './styles.scss'
import LogoSvg from '../Logo/logo'
import { useNavigate } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'

const Header = () => {
	const navigate = useNavigate()
	const onExit = () => {
		localStorage.removeItem('username')
		localStorage.removeItem('password')
		navigate('/')
	}
	return (
		<div className='header-container'>
				<LogoSvg/>
				<div>
				{localStorage.getItem('username')}
				<Tooltip title='Выйти' placement='left'>
				<a className='exit-icon' onClick={onExit}><LogoutOutlined /></a>
				</Tooltip>
				</div>

		</div>
	)
}

export default Header
