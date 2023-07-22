import React, { useEffect } from 'react'
import { isLoggedIn } from '../LoginAuth'
import { Navigate, redirect } from 'react-router'

type Props = {}

const UserLanding: React.FC<Props> = ({}) => {
	return (
    <>
      {isLoggedIn() || <Navigate to={'/'} />}
      <div>
        User Landing Page
      </div>
    </>
  )
}

export default UserLanding