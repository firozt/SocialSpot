import { Box } from '@chakra-ui/layout'
import { Button, Center, Divider, Flex, Heading, Select, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import User from '../../interfaces/User'
import axios, { AxiosResponse } from 'axios'
import Post from '../Post/Post'
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin'

type Props = {
	user: User
}

type SpotifyAlbumOrTrack = {
	name: string,
	imageurl: string,
}

type SpotifyExtractedData = {
	topArtists: SpotifyAlbumOrTrack[];
	topGenres: string[];
};
type SpotifyResponse = {
	msg: string,
	data: any,
	changed: '1' | '0',
}

const temp_data: SpotifyExtractedData = {
	topArtists: [
		{
			name: "test artists",
			imageurl: "https://i.scdn.co/image/ab6761610000e5eb4b2da0b72cab26ac518f1f0d"
		},
],
	topGenres: [
		"Test genres"
]
}



const AddPost: React.FC<Props> = ({user}) => {
	const [timeFrame, setTimeFrame] = useState<string>('');
	const [hasLinkedSpotify, setHasLinkedSpotify] = useState<boolean>(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);
	const [userTopData, setUserTopData] = useState<SpotifyExtractedData>(temp_data);

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
			} catch (error: any) {
			}
			finally {
				return false
			}
		}
		CheckSpotifyLinked()
	}, [])


	const handlePreview = async () => {
		if (!timeFrame) {
			alert('cannot leave empty')
			return
		}

		const token: string = localStorage.getItem('token') || 'null'
		const days: number = timeFrame == 'month' ? 30 : 7
		
		try {
			const response: AxiosResponse = await axios.get(
				`http://127.0.0.1:3000/spotify/top`,{
					headers: {
						Authorization: `Bearer ${token}`,
						days: days
					}
				})
			setUserTopData(response.data.data)
			// console.log(response.data)
			setShowPreview(true)
		} catch (error: any) {
			console.error(error.statusCode)
		}
	}

	const UpdateProfile = async () => {
		try {
			await axios.post(
				'http://127.0.0.1:3000/update_user_profile',
				{
					data: userTopData
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`
					}
				}
			)
		} catch (error: any) {
			alert('updating user profile went wrong')
		}
	}




  return (
    <Box className='card' 
		maxW={'930px'}>
			<Heading textAlign={'center'}>Update Profile</Heading>
			<Divider borderColor={'gray.200'} m={4}/>
			{!hasLinkedSpotify? (
							<Flex justify={'center'} align={'center'}>
								<Text mr={5}>Must be signed in with spotify to post</Text>
								<SpotifyLogin onSuccess={() => alert('success')}/>
				</Flex>
			):(
				<>
					<Center>
						<Flex flexDirection={'column'} lineHeight={'2rem'} id='addPostSelection'>
							<Box textAlign={'center'}>
								<Text>Update your profile with your current listening stats</Text>
								<Text>Last time you updated this was <i>example time</i></Text>
							</Box>
							<Box padding={2}>
									<Box m={2}>
										<Text w={'100%'} fontSize={'3xl'} my={5}>Week or Month</Text>
										<Select 
										value={timeFrame} 
										onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setTimeFrame(event.target.value)} 
										variant={'filled'} 
										bgColor={'gray.300'} 
										color={'gray.500'} 
										placeholder='Select option'
										w={'100%'}>
											<option value='week'>Week</option>
											<option value='month'>Month</option>
										</Select>
									</Box>
								<Center mt={5}>
									<Button onClick={handlePreview} w={'100%'}>Preview</Button>
								</Center>
							</Box>
						</Flex>
					</Center>
				<Center>
					{
						showPreview?
						<>
							<VStack>
								<Post date={'dd/mm/yy'} username={user.username} top_data={userTopData}/>
								<Button 
								height={'3rem'} 
								w={'100%'}
								onClick={UpdateProfile}>Update Profile With This Card</Button>
							</VStack>
						</>:
						<></>
					}
				</Center>
				</>
			)}
		</Box>
  )
}

export default AddPost