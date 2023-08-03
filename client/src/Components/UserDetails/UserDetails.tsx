import React, { ChangeEvent, useState } from 'react'
import User from '../../interfaces/User'
import { Box, Button, Divider, Flex, Heading, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import LoginResponse from '../../interfaces/LoginResponse'
import { redirect, useNavigate } from 'react-router-dom'

type Props = {
	user: User,
	relogUser: () => void,
}

const UserDetails: React.FC<Props> = ({user, relogUser}) => {
	const [username, setUsername] = useState<string>('')
	const navigate = useNavigate()
	const changeName = async () => {
		try {
			const response: AxiosResponse<LoginResponse> = await axios.post(
				`http://127.0.0.1:3000/set_name/${username}`,
				{
					username: username,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					}
				}
			)
			relogUser()
			console.log('old toke = ', localStorage.getItem('token'))
			localStorage.removeItem('token')
			localStorage.setItem('token',response.data.token) // reset token
			navigate('/')

		} catch (error: any) {
			console.error(error)
		}
	}

	const requestSpotifyToken = async () => {
		window.location.href = "http://localhost:3000/spotify";
		relogUser()
	}

	return (
		<Box 
			maxW={'550px'}
			className='card'>
				{!user.username ?
					(<>
						<Heading>Enter a username!</Heading>
						<Flex m={'2rem'}>
							<Input
								placeholder='username' 
								value={username}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}/>
							<Button onClick={changeName}>Enter</Button>
						</Flex>
					</>) :
					<>
						<Heading textAlign={'center'} mb={5}>Weclome {user.username}</Heading>
						<Heading fontSize={'2xl'} m={5}>Details</Heading>
						<Table>
							<Tbody>
								<Tr>
									<Td>
										Email
									</Td>
									<Td>
										{user.email}
									</Td>
								</Tr>
								<Tr>
									<Td>
										Username
									</Td>
									<Td>
										{user.username}
									</Td>
								</Tr>
								<Tr>
									<Td>
										Followers
									</Td>
									<Td>
										n/a
									</Td>
								</Tr>
							</Tbody>
						</Table>
					</>}
					{
						!localStorage.getItem('atoken')?
						(<>
							<Divider borderColor={'white'} my={5} />
							<Flex justify={'center'} align={'center'}>
								<Text mr={5}>Link Spotify</Text>
								<Button onClick={() => requestSpotifyToken()}>Sign in with Spotify</Button>
							</Flex>
						</>) : (<></>)
					}

			</Box>
		)
}
	

export default UserDetails