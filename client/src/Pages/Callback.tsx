import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {};

const Callback: React.FC<Props> = ({}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUrl: string = window.location.href;
    const urlArray: string[] = currentUrl.split('code=');

    if (urlArray.length !== 2) {
      navigate('/profile');
      return; // Early return to prevent further execution
    }

    const spotifyToken: string = urlArray[1];
    
    const getAccessTokens = async () => {
      // now we get access and refresh tokens from this
      const token: string = localStorage.getItem('token') || 'null'
      try {
        await axios.get(
          'http://localhost:3000/get_spotify_tokens',
          {
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  code: spotifyToken
              },
          })
      } catch (error: any) {
        console.error(error)
        navigate('/profile')
      }
    }
    getAccessTokens()
    navigate('/profile');
  }, [navigate]);

  return <div></div>;
};

export default Callback;
