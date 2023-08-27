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
			name: "Deftones",
			imageurl: "https://i.scdn.co/image/ab6761610000e5eb4b2da0b72cab26ac518f1f0d"
		},
		{
			name: "Mac DeMarco",
			imageurl: "https://i.scdn.co/image/ab6761610000e5eb3cef7752073cbbd2cc04c6f0"
		},
		{
			name: "Radiohead",
			imageurl: "https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd"
		},
		{
			name: "slowthai",
			imageurl: "https://i.scdn.co/image/ab6761610000e5ebd35231e23d5af811b8fdca7a"
		},
		{
			name: "The Strokes",
			imageurl: "https://i.scdn.co/image/ab6761610000e5ebcaea403b29f6a09260b6a18a"
		},
],
	topGenres: [
		"alternative metal",
		"nu metal",
		"rap metal",
		"rock",
		"sacramento indie"
]
}



const AddPost: React.FC<Props> = ({user}) => {
	const [type, setType] = useState<string>('');
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
				return false;
			} catch (error: any) {
				alert('check user spotify call is not working')
				return false;
			}
		}
		CheckSpotifyLinked()
	}, [])


	const handlePreview = async () => {
		if (!type || !timeFrame) {
			alert('cannot leave empty')
			return
		}

		const token: string = localStorage.getItem('token') || 'null'
		const accessToken: string = localStorage.getItem('atoken') || 'null'
		const days: number = timeFrame == 'month' ? 30 : 7
		
		try {
			const response: AxiosResponse = await axios.get(
				`http://127.0.0.1:3000/top/${type}`,{
					headers: {
						Authorization: `Bearer ${token}`,
						access_token: accessToken,
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
							<Box m={2} padding={2}>
								<Flex>
									<Box m={2}>
										<Text fontSize={'3xl'} my={5}>Tracks or Artists</Text>
										<Select
										value={type} 
										onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setType(event.target.value)} 
										variant={'filled'} 
										bgColor={'gray.300'} 
										color={'gray.500'} 
										placeholder='Select option'
										w={'100%'}>
											<option value='tracks'>Tracks</option>
											<option value='artists'>Artists</option>
										</Select>
									</Box>
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
								</Flex>
								<Center mt={5}>
									<Button onClick={handlePreview} w={'100%'}>Preview</Button>
								</Center>
							</Box>
						</Flex>
					</Center>
				<Center>
					{
						showPreview?
						<Post username={user.username} top_data={userTopData}/> :
						<></>
					}
				</Center>
				</>
			)}
		</Box>
  )
}

export default AddPost