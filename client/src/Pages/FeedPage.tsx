import { Box, Center, Flex, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar/Navbar'
import Post from '../Components/Post/Post'
import axios, { AxiosResponse } from 'axios'
import Following from '../Components/Following/Following'

type Props = {
  isMobile: boolean
}

type FollowingData = { // TODO

}

const FeedPage: React.FC<Props> = ({isMobile}) => {
  const [followingData, setFollowingData] = useState<[]>() // TODOL: add type

  useEffect(() => {
    // load users following
    console.log('getting feed...')
    const fetchFollowingData = async () => {
      try {
        const following: AxiosResponse = await axios.get('http://127.0.0.1:3000/following_data',{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        console.log(following.data)
        setFollowingData(following.data)
      } catch (error) {
        alert(`error with getting feed. ${error}`)
      }
    }
    fetchFollowingData()
  }, [])

  return (
    <Table>
      <Tbody>
        <Tr>
          <Td w={isMobile ? '2rem' : 'min(25vw,250px)'}>
            <Navbar isMobile={isMobile} />
          </Td>
          <Td>
            {
              followingData ? 
              followingData.length != 0 ?
              <>
                <Center display={'flex'} flexDir={'column'}>
                  {
                    followingData.map((item: any, index: number) => (
                      <Post date={item.date} username={item.username} key={index} top_data={item.data}/>
                    ))
                  }
                </Center>
              </> :
              <Flex flexDir={'column'} height={'100vh'} textAlign={'center'} align={'center'} justify={'center'} lineHeight={'4rem'} color={'#1f1f1f'} maxW={'1200px'}>
                <Text fontSize={'5xl'} >You arent current following anyone with a profile!</Text>
                <Text fontSize={'5xl'}>Go to user profile to add someone</Text>
                  
              </Flex> :
              <>
                <Text>Loading...</Text>
              </>
            }
          </Td>
        </Tr>
      </Tbody>
  </Table>
  )
}

export default FeedPage