import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import Following from '../Components/Following/Following'
import { Box, Button, Center, Flex, HStack, Heading, Icon, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react'
import Navbar from '../Components/Navbar/Navbar'
import { FiCrosshair, FiDelete, FiX } from 'react-icons/fi'
import UserDetails from '../Components/UserDetails/UserDetails'
import FindFriends from '../Components/FindFriends/FindFriends'
import AddPost from '../Components/AddPost/AddPost'


type Props = {
  isMobile: boolean
}


const ProfilePage: React.FC<Props> = ({isMobile}) => {
  const [user, setUser] = useState<User>()
  const [relogUser, setRelogUser] = useState<boolean>(false);
  const [hasTokens, setHasTokens] = useState<boolean>(false);

  const checkHasTokens = (): boolean => {
    const tokenbool: boolean = !!(localStorage.getItem('atoken') && localStorage.getItem('rtoken'));
    setHasTokens(tokenbool)
    return tokenbool
  }

  const navigate = useNavigate()
  // checks if user is logged in on page mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user: User = await getUser()
        console.log(user)
        setUser(user)
      } catch (error) {
        // validating token went wrong, log user out
        localStorage.removeItem('token')
        navigate('/login')
      }
    }
    
    checkUser()
  },[relogUser])

	return (
    <>
      <Table>
        <Tbody>
          <Tr>
            <Td w={isMobile ? '2rem' : 'min(25vw,250px)'}>
              <Navbar isMobile={isMobile} />
            </Td>
            <Td>
              <Center>
                {!user ? (<Text>Loading...</Text>):
                (
                  <Flex flexWrap={'wrap'} justifyContent={'center'}>
                    <UserDetails user={user} relogUser={() => setRelogUser(!relogUser)} />
                    <Following relogUser={relogUser} />
                    <FindFriends relogUser={() =>setRelogUser(!relogUser)}/>
                    <AddPost user={user}/>
                  </Flex>
                )}
              </Center>
            </Td>
          </Tr>
        </Tbody>
      </Table>

    </>
  )
}


export default ProfilePage