import React, { ChangeEvent, useEffect, useState } from 'react'
import User from '../../interfaces/User'
import { Box, Button, Divider, Flex, Heading, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import LoginResponse from '../../interfaces/LoginResponse'
import { redirect, useNavigate } from 'react-router-dom'
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin'

type Props = {
	user: User,
	relogUser: () => void,
}

const UserDetails: React.FC<Props> = ({user, relogUser}) => {
	const [username, setUsername] = useState<string>('');
	const [hasLinkedSpotify, setHasLinkedSpotify] = useState<boolean>(false);
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
			console.log('old token = ', localStorage.getItem('token'))
			localStorage.removeItem('token')
			localStorage.setItem('token',response.data.token) // reset token
			navigate('/')

		} catch (error: any) {
			console.error(error)
		}
	}

	useEffect(() => {
		const CheckSpotifyLinked = async (): Promise<boolean> => {
			try {
				const response: AxiosResponse = await axios.get(`http://127.0.0.1:3000/has_linked_spotify`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`
					}
				})
				if (response.status == 200) {
					setHasLinkedSpotify(true)
					return true;
				}
				return false;
			} catch (error: any) {
				return false;
			}
		}
		CheckSpotifyLinked()
	}, [])

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
						{String(hasLinkedSpotify)}
					</>}
					{
						!hasLinkedSpotify?
						(<>
							<Divider borderColor={'white'} my={5} />
								<SpotifyLogin onSuccess={relogUser} />
						</>) : (<></>)
					}

			</Box>
		)
}
	

export default UserDetails