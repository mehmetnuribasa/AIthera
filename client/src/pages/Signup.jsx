import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        is_admin: isAdmin ? 1 : 0,
      });
      console.log('Signup successful:', response.data);
      alert('Signup successful!');
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error.response ? error.response.data.message : error.message);
      alert('Signup failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-10">
      <div className="max-w-lg w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-600 mb-5">Sign Up</h1>
          <p className="text-slate-500 text-sm">
            Create your account to access personalized therapy sessions and manage your anxiety effectively.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* First Name Field */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-600 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-600 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
          </div>

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
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[var(--color-primary)] font-semibold hover:cursor-pointer hover:text-[var(--color-secondary)] transition ease-linear duration-300"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;