import { Box, Center, Divider, Flex, Heading, Icon, List, ListIcon, ListItem, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { FiEdit, FiMic, FiPieChart, FiShare, FiUser } from 'react-icons/fi'

type Props = {
	// username: string,
	// top_artists: string[],
}

const Post: React.FC<Props> = ({}) => {
	const [comments, setComments] = useState<string[]>([]);
  return (
    <Box id='post-container' className='card' borderRadius={'30px'} maxW={'750px'} minH={'500px'} mb={10}>
			<Flex align={'center'} >
				<Icon as={FiUser} boxSize={'100px'} mr={2}/>
				<Heading>USERNAME</Heading>
			</Flex>
			<Divider m={2} borderColor={'gray.200'}/>
			<div id='post' >
				<Box >
					<Center>
						<Icon as={FiPieChart} boxSize={'300px'} />
					</Center>
				</Box>
				<Box>
					<Heading textAlign={'center'} mt={4} mb={2}>Top Artists</Heading>
					<Center>
						<List my={2} spacing={3} fontSize={'xl'} lineHeight={'2rem'}>
							<ListItem>
								1 - Drake
							</ListItem>
							<ListItem>
								2 - JCole
							</ListItem>
							<ListItem>
								3 - Deftones
							</ListItem>
							<ListItem>
								4 - Radiohead
							</ListItem>
							<ListItem>
								5 - The Strokes
							</ListItem>
						</List>
					</Center>
				</Box>
			</div>
		</Box>
  )
}

export default Post