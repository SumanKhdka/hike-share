import React from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { client } from '../client';
import { useNavigate } from 'react-router-dom';
import hikeShareVid from '../assests/hikeShare_vid.mp4';
import logo from '../assests/logo.png';

const GoogleLoginComponent = () => {
  const navigate = useNavigate();
  // Logout function to log the user out of Google and clear the local storage
  const logOut = () => {
    googleLogout();
    localStorage.clear();
  };

  return (
    <div className='flex justify-start items-center flex-col h-screen'>
      <div className='relative w-full h-full'>
        <video
          src={hikeShareVid}
          type='video/mp4'
          loop
          controls={false}
          muted
          autoPlay
          className='w-full h-full object-cover'
        />
        <div className='absolute flex flex-col justify-center items-center top-0 right-0 bottom-0 left-0 bg-blackOverlay'>
          <div className='p-5'>
            <img src={logo} width='250px' height='150px' alt='logo' />
          </div>
          <div className='shadow-2xl'>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const token = credentialResponse.credential;
                  const decoded = jwtDecode(token);
                  const { given_name, email, sub, picture } = decoded;
                  const profileObj = {
                    name: given_name,
                    email: email,
                    googleId: sub,
                  };
                  localStorage.setItem(
                    'user',
                    JSON.stringify({ ...profileObj, picture, sub })
                  );

                  // Creating sanity user schema with user details
                  const doc = {
                    _id: sub,
                    _type: 'user',
                    userName: given_name,
                    image: picture,
                  };

                  // Create schema
                  await client.createIfNotExists(doc).then(() => {
                    navigate('/');
                  });
                } catch (error) {
                  console.error('Error creating schema', error);
                }
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </div>
          <div className='mt-10'>
            <button onClick={logOut}>Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginComponent;
