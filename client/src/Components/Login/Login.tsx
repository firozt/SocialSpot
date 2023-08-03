import React, { ChangeEvent, FormEvent, useState } from 'react'
import LoginResponse from '../../interfaces/LoginResponse';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Center, Heading, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react';

type Props = {}

const Login: React.FC<Props> = ({}) => {
	const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [show, setShow] = React.useState(false)
	const navigate = useNavigate();

  const handleSubmit = async () => {
    const credentials = `${email}:${password}`;
    const encodedCredentials = btoa(credentials);
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        'http://localhost:3000/login',
        {},
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data)
      setMessage(`successfull login, hello ${response.data.user.username}`)
      localStorage.setItem('token',response.data.token)
      navigate('/profile')
      
    } catch (error: any) {
      if (error?.response?.status == 404) {
        setMessage('invalid details, user not found')
      }
      else {
        setMessage('Unknown error, try again later')
        console.error(error)
      }
    }
  }

  const handleClick = () => setShow(!show)

  return (
    <Box 
    bgColor={'#1f1f1f'}
    color={'gray.200'}
    border={'2px solid'}
    borderColor={'gray.400'}
    borderRadius={'10px'}
    padding={10}
    w={'min(450px,95vw)'}
    margin={'auto'}
    my={10}
    >
			<Heading fontSize={'5xl'}>Login</Heading>
      <Text 
      fontSize={'lg'}
      m={2}>
        { message || 'enter details'}
      </Text>
      <form>
        <Input 
          type='text' 
          placeholder='email' 
          variant={'filled'}
          bg={'gray.200'}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        /> <br/>
        <InputGroup my={1} size='md'>
          <Input
            pr='4.5rem'
            variant={'filled'}
            bg={'gray.200'}
            type={show ? 'text' : 'password'}
            placeholder='Enter password'
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={handleClick}>
            {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Box>
          <Button 
          onClick={() => handleSubmit()} 
          width={'100%'}
          my={1}>
            Submit
          </Button>
          <Button 
          onClick={() => navigate('/')}
          width={'100%'}
          my={1}>
            Back
          </Button>
        </Box>
      </form>
      <Text mt={2}
      color={'gray'}>
        New user? register by clicking <i onClick={() => navigate('/register')}>here</i>
      </Text>
		</Box>
  )
}

export default Login