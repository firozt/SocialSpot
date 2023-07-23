import React, { useEffect, useState } from 'react'
import { getUser } from '../LoginAuth'
import User from '../interfaces/User'
import { useNavigate } from 'react-router-dom'
type Props = {}

const UserLanding: React.FC<Props> = ({}) => {
  const [user, setUser] = useState<User>()
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const user: User = await getUser()
      if (!user) {
        localStorage.removeItem('token')
        navigate('/')
      } else {
        setUser(user)
        console.log()
      }
    }
    if (localStorage.getItem('token') != null) {
      checkUser()
    }
  },[])

  const logout = async (): Promise<void> => {
    localStorage.removeItem('token')
    navigate('/')
  }

	return (
    <>
      <div>
        <h1>User Landing Page</h1>
        <h2>Welcome {user?.name}</h2>
        <button onClick={logout}>Logout</button>
      </div>
    </>
  )
}

export default UserLanding