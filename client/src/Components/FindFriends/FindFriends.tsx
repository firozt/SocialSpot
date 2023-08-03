import { Box, Button, Divider, Flex, Heading, Icon, Input, Table, Td, Text, Tr } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import React, { ChangeEvent, useState } from 'react'
import { FiHome, FiPlus, FiSearch } from 'react-icons/fi'
import SearchUsersResponse from '../../interfaces/SearchUsersResponse'
import User from '../../interfaces/User'
import UserCard from '../UserCard/UserCard'

type Props = {
	relogUser: () => void
}

const FindFriends: React.FC<Props> = ({relogUser}) => {
	const [query, setQuery] = useState<string>('')
	const [result, setResult] = useState<User[]>()

	const fetchUsers = async () => {
		try {
			const request: AxiosResponse<SearchUsersResponse> = await axios.get(
				`http://127.0.0.1:3000/search_users/${query}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					}
				}
			)
			setResult(request.data.query) // {username, id}

		} catch (error: any) {
			console.error(error)
		}
	}

	const followUser = async (username: string) => {
		try {
			const followUser = await axios.post(
				`http://127.0.0.1:3000/follow/${username}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					}
				}
			)
			relogUser()
			setResult(undefined)
			fetchUsers()
		} catch (error: any) {
			console.error(error)
		}
	}

  return (
		<Box
		maxW={'930px'}
		className='card'
		>
			<Heading textAlign={'center'} mb={'2rem'}>Find Followers</Heading>
			<Divider borderColor={'gray.200'} mb={10}/>

			<Flex justifyContent={'center'}>
				<Icon as={FiSearch} boxSize="2rem" mr={'1rem'}/>
				<Input 
					value={query}
					maxW={'450px'}
					placeholder='Username'
					bg={'gray.300'}
					variant={'filled'}
					onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
				/>
				<Button onClick={() => fetchUsers()}>Search</Button>
			</Flex>
			<Flex wrap={'wrap'}>
				{
					result?.map((item: User, index: number) => {
						return (
							<UserCard
								username={item.username} 
								key={index}
								onClick={() => followUser(item.username)} 
							/>
						)
					})
				}
				{result?.length == 0? <Text fontSize={'2xl'} margin={'auto'} mt={'2rem'}>No users found</Text> : <></>}
			</Flex>
		</Box>
  )
}

export default FindFriends