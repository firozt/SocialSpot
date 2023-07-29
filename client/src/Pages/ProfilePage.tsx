import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import Following from '../Components/Following/Following'
import { Box, Button, Center, Heading, Table, Td, Text } from '@chakra-ui/react'
import Navbar from '../Components/Navbar/Navbar'


type Props = {
  isMobile: boolean
}


const ProfilePage: React.FC<Props> = ({isMobile}) => {
  const [user, setUser] = useState<User>()
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
  },[])

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('spotify_token')
    navigate('/')
  }


	return (
    <>
      <Table>
        <Td w={isMobile ? '2rem' : 'min(25vw,300px)'}>
          <Navbar isMobile={isMobile} />
        </Td>
        <Td>
          <Center>
            {!user ? <p>Loading...</p> : 
            <div>
              <Heading>User Landing Page</Heading>
              {user.username ? 
              <Text>Welcome {user.username}</Text> :
              <>
                <Text>
                  Your username hasnt been set yet
                  click <i onClick={() => navigate('/profile')}>here</i> to setup profile
                </Text>
              </>
              }
              <Button onClick={logout}>Logout</Button>
              <Following/>
            </div>  
        }</Center>
        </Td>
      </Table>

    </>
  )
}


export default ProfilePage