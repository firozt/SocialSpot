import React, { ChangeEvent, FormEvent, useState } from 'react'
import LoginResponse from '../../interfaces/LoginResponse';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

type Props = {}

const Login: React.FC<Props> = ({}) => {
	const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
	const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
      setMessage(`successfull login, hello ${response.data.user.name}`)
      localStorage.setItem('token',response.data.token)
      navigate('/user')
      
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

  return (
    <div>
			<h1>Login</h1>
      { message || 'enter details'}
      <form onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
        <input 
        type='text' 
        placeholder='email' 
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/> <br/>
        <input 
        type='password' 
        placeholder='password' 
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}/> <br/>        
        <button>Submit</button>
      </form>
      <button onClick={() => navigate(-1)}>Back</button>
		</div>
  )
}

export default Login