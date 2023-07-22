import React, { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom';
import { isLoggedIn } from '../LoginAuth';


type Props = {}


const Homepage: React.FC<Props> = ({}) => {

  return (
		<>
		{ isLoggedIn() ? <Navigate to={'/user'} /> : null }

			<Link to={'./login'}><button>Login</button></Link>
			<Link to={'./register'}><button>Register</button></Link>
		</>
	)
}

export default Homepage;