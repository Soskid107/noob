import React, { useState, useEffect } from 'react';

function Dashboard({ token, handleLogout, setView }) {
  const [userBio, setUserBio] = useState('');
  const [wisdom, setWisdom] = useState('');
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
          setUserBio(data.bio);
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

  const fetchWisdom = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/wisdom`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWisdom(data.text);
      } else {
        setMessage('Failed to fetch wisdom.');
      }
    } catch (error) {
      console.error('Error fetching wisdom:', error);
      setMessage('An error occurred while fetching wisdom.');
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to your Dashboard!</h2>
      <p>Your Bio: {userBio}</p>
      <button onClick={fetchWisdom}>Surprise Me with Wisdom</button>
      {wisdom && <p className="wisdom-text">{wisdom}</p>}
      <button onClick={() => setView('profile')}>Update Profile</button>
      <button onClick={handleLogout}>Logout</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Dashboard;
