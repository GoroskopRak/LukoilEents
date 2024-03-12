import React  from 'react'
import  './styles.scss'
import LogoSvg from '../Logo/logo'

const Header = () => {
	return (
		<div className='header-container'>
				<LogoSvg/>
				{localStorage.getItem('username')}

		</div>
	)
}

export default Header
