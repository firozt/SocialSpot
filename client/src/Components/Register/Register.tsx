import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Box, Button, Center, Heading, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react'
import SpotifyLogin from '../SpotifyLogin/SpotifyLogin'


type Props = {}

const Register: React.FC<Props>= ({}) => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [show, setShow] = useState<boolean>(false)
  const [spotifyLinked, setSpotiftyLinked] = useState<boolean>(false)

  const navigate = useNavigate()


  const handleSubmit = async () => {
    // check inputs
    let errormsg = ''
    if (email == '') {
      errormsg += 'email is empty, '
    }
    if (password == '') {
      errormsg += 'password is empty, '
    }
    if (!spotifyLinked) {
      errormsg += 'spotify must be linked'
    }
    
    if (errormsg != '') {
      setMessage(errormsg)
      return
    }

    // successfull inputs
    const credentials = `${email}:${password}`;
    const encodedCredentials = btoa(credentials);
    try {
      const response = await axios.post(
        'http://localhost:3000/register',
        {},
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data)
      alert('successful, please login')
      navigate('/login')
    } catch (error: any) {

      console.error(error)
    }
  }

  const handleClick = () => setShow(!show)

  return (
    <Box 
    color={'gray.200'}
    bgColor={'#1f1f1f'}
    border={'2px solid'}
    borderColor={'gray.400'}
    borderRadius={'10px'}
    padding={10}
    w={'min(450px,95vw)'}
    margin={'auto'}
    my={10}>
			<Heading fontSize={'5xl'}>Register</Heading>
      <Text 
      size={'lg'}
      m={2}>
        <Text>
          {message || 'enter details'}
        </Text>
      </Text>
      <form>
        <Input 
        type='text' 
        variant={'filled'}
        bg={'gray.200'}
        placeholder='email' 
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/> <br/>
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
          <SpotifyLogin onSuccess={() => setSpotiftyLinked(true)}/>
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
        <Text mt={2} textAlign={'center'}
        color={'gray'}>
          Already have an account? login by clicking <i onClick={() => navigate('/login')}>here</i>
        </Text>
      </form>
    </Box>
  )
}

export default Register