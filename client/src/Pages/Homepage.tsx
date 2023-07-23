import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getUser } from '../LoginAuth';

type Props = {}


const Homepage: React.FC<Props> = ({}) => {

	const navigate = useNavigate();
	useEffect(() => {
		const validToken = async () => {
			try {
				await getUser() // throws error if doesnt exist
				navigate('/user')

			} catch (error: unknown) {
				// user not logged in, continue loading page
				localStorage.removeItem('token')
			}
		}
		if (localStorage.getItem('token') != null) {
			validToken()
		}
	}, [])

	return (
		<>
			<Link to={'./login'}><button>Login</button></Link>
			<Link to={'./register'}><button>Register</button></Link>
		</>
	)
}

export default Homepage;