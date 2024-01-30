import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MdDownloadForOffline } from 'react-icons/md';
import { AiTwotoneDelete } from 'react-icons/ai';
import { BsFillArrowUpRightCircleFill } from 'react-icons/bs';

// Importing utility functions
import { fetchUser } from '../utils/fetchUser';
import { client, urlFor } from '../client';

const Pin = ({ pin }) => {
  // State for tracking hover and saving post
  const [postHovered, setPostHovered] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Extracting values from the pin prop
  const { postedBy, image, _id, destination, save } = pin;

  // Fetching user (assuming this function is implemented)
  const user = fetchUser();

  // Function to delete a pin
  const deletePin = (id) => {
    // Deleting the pin and reloading the page
    client.delete(id).then(() => {
      window.location.reload();
    });
  };

  // Checking if the pin is already saved by the current user
  let alreadySaved = !!(save?.filter(
    (item) => item?.postedBy?._id === user?.googleId
  )).length;

  alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

  // Function to save a pin
  const savePin = (id) => {
    if (alreadySaved?.length === 0) {
      setSavingPost(true);

      // Saving the pin
      client
        .patch(id)
        .setIfMissing({ save: [] })
        .insert('after', 'save[-1]', [
          {
            _key: uuidv4(),
            userId: user?.googleId,
            postedBy: {
              _type: 'postedBy',
              _ref: user?.googleId,
            },
          },
        ])
        .commit()
        .then(() => {
          // Reloading the page and updating the savingPost state
          window.location.reload();
          setSavingPost(false);
        });
    }
  };

  return (
    <div className='m-2'>
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${_id}`)}
        className=' relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out'
      >
        {image && (
          <img
            className='rounded-lg w-full '
            src={urlFor(image).width(250).url()}
            alt='user-post'
          />
        )}
        {postHovered && (
          <div
            className='absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50'
            style={{ height: '100%' }}
          >
            <div className='flex items-center justify-between'>
              <div className='flex gap-2'>
                {/* Download button */}
                <a
                  href={`${image?.asset?.url}?dl=`}
                  download
                  onClick={(e) => {
                    // Preventing event propagation to the parent element
                    e.stopPropagation();
                  }}
                  className='bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none'
                >
                  <MdDownloadForOffline />
                </a>
              </div>
              {/* Conditional rendering of Save button */}
              {alreadySaved?.length !== 0 ? (
                <button
                  type='button'
                  className='bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none'
                >
                  {pin?.save?.length} Saved
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    // Preventing event propagation to the parent element
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  type='button'
                  className='bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none'
                >
                  {pin?.save?.length} {savingPost ? 'Saving' : 'Save'}
                </button>
              )}
            </div>
            <div className=' flex justify-between items-center gap-2 w-full'>
              {/* Conditional rendering of external link */}
              {destination?.slice(8).length > 0 ? (
                <a
                  href={destination}
                  target='_blank'
                  className='bg-white flex items-center gap-2 text-black font-bold p-2 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md'
                  rel='noreferrer'
                >
                  {' '}
                  <BsFillArrowUpRightCircleFill />
                  {destination?.slice(8, 17)}...
                </a>
              ) : undefined}
              {/* Conditional rendering of delete button for the pin owner */}
              {postedBy?._id === user?.googleId && (
                <button
                  type='button'
                  onClick={(e) => {
                    // Preventing event propagation to the parent element
                    e.stopPropagation();
                    deletePin(_id);
                  }}
                  className='bg-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-dark opacity-75 hover:opacity-100 outline-none'
                >
                  <AiTwotoneDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Link to the user profile */}
      <Link
        to={`/user-profile/${postedBy?._id}`}
        className='flex gap-2 mt-2 items-center'
      >
        {/* User profile image */}
        <img
          className='w-8 h-8 rounded-full object-cover'
          src={postedBy?.image}
          alt='user-profile'
        />
        {/* User profile name */}
        <p className='font-semibold capitalize'>{postedBy?.userName}</p>
      </Link>
    </div>
  );
};

export default Pin;
