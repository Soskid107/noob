import React, { useState } from 'react';

function Auth({ setToken, setView }) {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const url = `${process.env.REACT_APP_API_URL}${isRegister ? '/register' : '/login'}`;
    const body = isRegister ? { username, password, bio } : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.text();

      if (response.ok) {
        if (!isRegister) {
          const jsonResponse = JSON.parse(data);
          setToken(jsonResponse.accessToken);
          localStorage.setItem('token', jsonResponse.accessToken);
          setView('dashboard');
        } else {
          setMessage('Registration successful! Please log in.');
          setIsRegister(false);
        }
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isRegister && (
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        )}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
      </p>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Auth;
