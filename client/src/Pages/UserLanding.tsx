import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'


type Props = {}

interface SpotifyResponse {
  msg: string,
  url: string,
}

const UserLanding: React.FC<Props> = ({}) => {
  const [hasAuthed, setHasAuthed] = useState<boolean>(false)
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
    // check if token is in url, if so store it to local storage
    const checkSpotifyToken = () => {
      // const currentURL: string = window.location.href;
      // const URLArray: string[] = currentURL.split('code=')
      // if (URLArray.length >= 2){
        // user has authed spotify
        // localStorage.setItem('spotify_token',URLArray[1])
        // setHasAuthed(!hasAuthed)
      // }
    } 
    
    checkUser()
    checkSpotifyToken()    
  },[])

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('spotify_token')
    navigate('/')
  }

  const requestSpotify = async () => {
    const token: string = localStorage.getItem('token') || 'null'
    const response: AxiosResponse<SpotifyResponse> = await axios.get(
      'http://127.0.0.1:3000/spotify',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      }
    )
    window.location.href = response.data.url;
  }

	return (
    <>
      <div>
        <h1>User Landing Page</h1>
        <h2>Welcome {user?.name}</h2>
        {hasAuthed || <button onClick={requestSpotify}>Request Spotify</button>}
        {/* {!hasAuthed || show spotify data} */}
        <button onClick={logout}>Logout</button>
      </div>
    </>
  )
}


export default UserLanding