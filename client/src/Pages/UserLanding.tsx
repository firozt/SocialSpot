import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import Following from '../Components/Following/Following'


type Props = {}


const UserLanding: React.FC<Props> = ({}) => {
  const [user, setUser] = useState<User>()
  const navigate = useNavigate()

  // checks if user is logged in on page mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user: User = await getUser()
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
      {!user ? <>Loading...</> : 
      <div>
        <h1>User Landing Page</h1>
        {user.name ? 
        <h2>Welcome {user.name}</h2> :
        <>
          <h2>
            Your username hasnt been set yet
            click <i>here</i> to setup profile
          </h2>
        </>
        }
        <button onClick={logout}>Logout</button>
      </div>  
      }
      <Following/>
    </>
  )
}


export default UserLanding