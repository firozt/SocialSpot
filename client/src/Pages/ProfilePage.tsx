import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
import Following from '../Components/Following/Following'
import { Center, Flex, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react'
import Navbar from '../Components/Navbar/Navbar'
import FindFriends from '../Components/FindFriends/FindFriends'
import AddPost from '../Components/AddPost/AddPost'
import UserDetails from '../Components/UserDetails/UserDetails'


type Props = {
  isMobile: boolean
}


const ProfilePage: React.FC<Props> = ({isMobile}) => {
  const [user, setUser] = useState<User>()
  const [relogUser, setRelogUser] = useState<boolean>(false);

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