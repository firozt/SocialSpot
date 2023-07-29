import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Register from '../Components/Register/Register'


type Props = {}

const RegisterPage: React.FC<Props>= ({}) => {
  const navigate = useNavigate()
  return (
    <div>
      <Register/>
    </div>
  )
}

export default RegisterPage