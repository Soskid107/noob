import React, { useState, useEffect } from 'react';

function Profile({ token, setView }) {
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBio(data.bio);
        } else {
          setMessage('Failed to fetch profile.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('An error occurred while fetching profile.');
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An error occurred while updating profile.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Update Your Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <textarea
          placeholder="Your Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
        <button type="submit">Update Bio</button>
      </form>
      {message && <p className="message">{message}</p>}
      <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
    </div>
  );
}

export default Profile;
