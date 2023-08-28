import { Box, Center, Divider, Flex, Heading, Icon, Img, List, ListIcon, ListItem, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { FiEdit, FiMic, FiPieChart, FiShare, FiUser } from 'react-icons/fi'

type SpotifyAlbumOrTrack = {
	name: string,
	imageurl: string,
}

type SpotifyExtractedData = {
	topArtists: SpotifyAlbumOrTrack[];
    topGenres: string[];
};
type Props = {
	username: string,
	top_data: SpotifyExtractedData,
	date: string
}

const Post: React.FC<Props> = ({username, top_data, date}) => {
	const [comments, setComments] = useState<string[]>([]);

	useEffect(() => {
		const handleTopData = async () => {
			
		}
		handleTopData()
	}, [])

  return (
    <Box id='post-container' className='card' borderRadius={'30px'} maxW={'900px'} minW={'450px'} minH={'500px'} mb={10}>
			<Flex align={'center'} >
				<Icon as={FiUser} boxSize={'100px'} mr={2}/>
				<Box w={'100%'} overflow={'hidden'}>
					<Heading  fontSize={'5xl'} textAlign={'center'}>{username}</Heading>
					<Divider m={2} borderColor={'gray.200'}/>
				</Box>
			</Flex>
			<div id='post' >
				<Box w={'100%'} maxW={'500px'}>
					<Flex flexDir={'column'} minW={'300px'} justifyContent={'space-between'}>
						<Box>
							<List my={2} spacing={3} fontSize={'xl'} lineHeight={'1.8rem'}>
								<ListItem>
									<Heading textAlign={'center'} mt={4} mb={2}>Top Artists</Heading>
								</ListItem>

								{
									
									top_data.topArtists.map((item: SpotifyAlbumOrTrack, index: number) => {
										return (
											<ListItem key={index}>
												<Table w={'100%'}>
													<Tbody w={'100%'}>
														<Tr>
															<Td minW={'50%'}>
																<Text fontSize={'2xl'} lineHeight={'2rem'} verticalAlign={'middle'} h={'min-content'} my={'auto'} mx={2} justifySelf={'center'}>
																	{item.name}
																</Text>
															</Td>
															<Td>
																<Img maxW={'150px'} maxH={'150px'} borderRadius={'1000px'} src={item.imageurl}/>
															</Td>
														</Tr>
													</Tbody>
												</Table>
												<Divider my={3} borderColor={'rgb(92, 76, 180)'}/>
											</ListItem>
										)
									})
								}
							</List>
						</Box>
						<Box>
							<List p={5} borderRadius={'25px'}  spacing={3} fontSize={'xl'} lineHeight={'1.8rem'}>
								<ListItem>
									<Heading textAlign={'center'} mt={4} mb={2}>Top Genres</Heading>
								</ListItem>
								{
									top_data.topGenres.map((item: string, index: number) => {
										return (
											<>
												<ListItem textAlign={'center'} key={index}>
													{String(index+1)} - {item}
												</ListItem>
											</>
										)
									})
								}
							</List>
						</Box>
					</Flex>
				</Box>
			</div>
			<i>{date}</i>
		</Box>
  )
}

export default Post