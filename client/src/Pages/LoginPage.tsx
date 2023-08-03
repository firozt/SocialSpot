import React, { useState } from 'react'
import Login from '../Components/Login/Login'
import { Box, Center } from '@chakra-ui/react'

type Props = {}

const LoginPage: React.FC<Props> = ({}) => {
  return (
    <Box>
      <Login/>
    </Box>
  )
}

export default LoginPage