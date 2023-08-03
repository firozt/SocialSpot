import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import FollowingResponse from '../../interfaces/FollowingResponse'
import { Box, Button, Heading, Icon, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react'
import { FiHome, FiLogOut, FiSettings, FiUsers, FiX } from 'react-icons/fi';
import User from '../../interfaces/User';

type Props = {
	relogUser: boolean
}

const Following: React.FC<Props> = ({relogUser}) => {
	const [following, setFollowing] = useState<User[]>([]);


	// gets users following
	useEffect(() => {
		fetchFollowing()
	}, [relogUser])

	const fetchFollowing = async () => {
		const token: string  = localStorage.getItem('token') || 'null';
		try {
			const response: AxiosResponse<FollowingResponse> = await axios.get(
				'http://127.0.0.1:3000/following',
				{
					headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
					},
				})
			setFollowing(response.data.following)
		} catch (error) {
			console.error(error)
		}
	}

	const unfollow = async (username: string): Promise<void> => {
		
    const token: string  = localStorage.getItem('token') || 'null';
		try {
			const response: AxiosResponse = await axios.post(
				`http://127.0.0.1:3000/unfollow/${username}`, 
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				})
			fetchFollowing()
		} catch (error: any) {
			console.error(error)
			alert('error occured')
		}
	}

  return (
		<Box
			className='card'
			minH={'400px'}
			maxW={'350px'}
			>
				<Heading textAlign={'center'} color={'gray.200'}>Following</Heading>
				{following.length == 0 ? (
				<Text mt={'2rem'}>User not currently following anyone</Text>
			) : (
				// <Table bg={'#1f1f1f'}>
				<Table>
					<Thead>
						<Tr>
							<Th color={'white'} textAlign={'center'}>
								Name
							</Th>						
							<Th color={'white'}>
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{following.map((item: User, index: number) => (
							<Tr key={index}>
								<Td textAlign={'center'} color={'white'}>{item.username}</Td>
								<Td w={'25px'}>
									<Button 
										id='following-button'
										w={'20px'}
										onClick={() => unfollow(item.username)}>
											<Icon as={FiX} boxSize="20px" />
									</Button>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			)}
    </Box>
  )
}

export default Following