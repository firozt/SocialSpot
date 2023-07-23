import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


type Props = {}

const Register: React.FC<Props>= ({}) => {

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate()


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const credentials = `${username}:${password}`;
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
      navigate('/login')
    } catch (error: any) {

      console.error(error)
    }
  }
  return (
    <div id='register' className='card'>
      <h1>Register</h1>
      {message || 'enter details'}
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

export default Register