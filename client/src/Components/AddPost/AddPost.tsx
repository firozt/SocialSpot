import { Box } from '@chakra-ui/layout'
import { Button, Center, Divider, Flex, Heading, Select, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import User from '../../interfaces/User'
import axios, { AxiosResponse } from 'axios'

type Props = {
	user: User
}

const AddPost: React.FC<Props> = ({user}) => {
	const requestSpotifyToken = async () => {
		try {
			const response: AxiosResponse = await axios.get(
				`http://127.0.0.1:3000/spotify`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					}
				}
			)
			window.location.href = response.data.url;
		} catch (error: any) {
			console.error(error)
		}
	}

  return (
    <Box className='card' 
		maxW={'930px'}>
			<Heading textAlign={'center'}>Add Post</Heading>
			<Divider borderColor={'gray.200'} m={4}/>
			{!localStorage.getItem('atoken')? (
							<Flex justify={'center'} align={'center'}>
								<Box>
								</Box>
								<Box></Box>
								<Text mr={5}>Must be signed in with spotify to post</Text>
								<Button onClick={() => requestSpotifyToken()}>Sign in with Spotify</Button>
						</Flex>
			):(
				<>
					<Center>
						<Flex lineHeight={'2rem'} id='addPostSelection'>
							<Box m={2} padding={2}>
								<VStack>
									<Box>
										<Text fontSize={'3xl'} my={5}>Tracks or Artists</Text>
										<Select 
										variant={'filled'} 
										bgColor={'gray.300'} 
										color={'gray.500'} 
										placeholder='Select option'
										w={'100%'}>
											<option value='option1'>Tracks</option>
											<option value='option2'>Artists</option>
										</Select>
									</Box>
									<Box>
										<Text w={'100%'} fontSize={'3xl'} my={5}>Week or Month</Text>
										<Select 
										variant={'filled'} 
										bgColor={'gray.300'} 
										color={'gray.500'} 
										placeholder='Select option'
										w={'100%'}>
											<option value='option1'>Weekly</option>
											<option value='option2'>Monthly</option>
										</Select>
									</Box>
								</VStack>
								<Center mt={5}>
									<Button w={'100%'}>Preview</Button>
								</Center>
							</Box>
							<Box m={2} bg={'#2a2929'} minH={'350px'} border={'1px solid black'} borderColor={'gray.400'} padding={2}>
								<Text fontSize={'3xl'} my={2} textAlign={'center'} p={2}>{user.username}'s top tracks this week:</Text>
							</Box>
						</Flex>
					</Center>
				</>
			)}
		</Box>
  )
}

export default AddPost