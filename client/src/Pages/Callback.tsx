import axios, { AxiosResponse } from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {};

interface SpotifyTokenResponse {
  access_token: string,
  refresh_token: string,
}

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
        const response: AxiosResponse<SpotifyTokenResponse> = await axios.get(
          'http://localhost:3000/get_spotify_tokens',
          {
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  code: spotifyToken
              },
          })
        localStorage.setItem('atoken',response.data.access_token)
        localStorage.setItem('rtoken',response.data.refresh_token)
      } catch (error: any) {
        console.error(error)
      }
    }
    getAccessTokens()
    navigate('/profile');
  }, [navigate]);

  return <div></div>;
};

export default Callback;
