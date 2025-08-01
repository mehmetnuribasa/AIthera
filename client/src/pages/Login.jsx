import React, { useState } from 'react';
import{ useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const { setIsAuthenticated } = useContext(AuthContext);

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
      setIsAuthenticated(true); // Update authentication state
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data.message : error.message);
      alert('Login failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-600 mb-5">
            Log In
          </h1>
          <p className="text-slate-500 text-sm">
            Your sessions are secure and private. We use advanced encryption to protect your data.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-600 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-2 rounded-2xl font-semibold hover:bg-[var(--color-secondary)] hover:cursor-pointer transition-ease-linear duration-300"
          >
            Log In
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-[var(--color-primary)] font-semibold hover:cursor-pointer hover:text-[var(--color-secondary)] transition ease-linear duration-300"
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login;