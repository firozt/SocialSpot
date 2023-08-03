import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getUser } from '../LoginAuth';
import { Button } from '@chakra-ui/react';

type Props = {}


const Homepage: React.FC<Props> = ({}) => {

	const navigate = useNavigate();
	useEffect(() => {
		const validToken = async () => {
			try {
				await getUser() // throws error if doesnt exist
				navigate('/profile')

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
			<Link to={'./login'}><Button>Login</Button></Link>
			<Link to={'./register'}><Button>Register</Button></Link>
		</>
	)
}

export default Homepage;