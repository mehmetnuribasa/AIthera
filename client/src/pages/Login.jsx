import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      // Store the access token in local storage
      localStorage.setItem('accessToken', response.data.accessToken);

      console.log(response.data);
      alert('Login successful!');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data.message : error.message);
      alert('Login failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login;