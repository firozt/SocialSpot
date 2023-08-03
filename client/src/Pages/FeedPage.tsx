import { Center, Flex, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react'
import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import Post from '../Components/Post/Post'

type Props = {
  isMobile: boolean
}

const FeedPage: React.FC<Props> = ({isMobile}) => {
  return (
    <Table>
      <Tbody>
        <Tr>
          <Td w={isMobile ? '2rem' : 'min(25vw,250px)'}>
            <Navbar isMobile={isMobile} />
          </Td>
          <Td>
            <Center display={'flex'} flexDir={'column'}>
              <Post />
              <Post />
              <Post />
            </Center>
          </Td>
        </Tr>
      </Tbody>
  </Table>
  )
}

export default FeedPage