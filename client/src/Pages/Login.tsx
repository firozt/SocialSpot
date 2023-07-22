import axios from 'axios'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
type Props = {}

const Login: React.FC<Props> = ({}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    try {
      const response = await axios.post(
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
      setMessage(`successfull login, hello ${response.data[0].name}`)
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
    <div id='login' className='card'>
      <h1>Login</h1>
      { message || 'enter details'}
      <form onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
        <input 
        type='text' 
        placeholder='username' 
        onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}/> <br/>
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