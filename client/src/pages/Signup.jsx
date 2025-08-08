import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validatePassword = (pwd) => {
    const rules = [
      { test: /.{8,}/, msg: 'At least 8 characters' },
      { test: /[A-Z]/, msg: 'At least one uppercase letter' },
      { test: /[a-z]/, msg: 'At least one lowercase letter' },
      { test: /\d/, msg: 'At least one number' },
      { test: /[^A-Za-z0-9]/, msg: 'At least one special character' },
    ];
    const failed = rules.filter(r => !r.test.test(pwd)).map(r => r.msg);
    setPasswordError(failed.length ? failed.join(', ') : '');
    return failed.length === 0;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      alert('Password does not meet the requirements.');
      return;
    }
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      alert('Passwords do not match.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        is_admin: isAdmin ? 1 : 0,
      });
      console.log('Signup successful:', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error.response ? error.response.data.message : error.message);
      alert('Signup failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-20">
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
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
            <p className={`text-xs ${emailError ? 'text-red-400' : 'text-slate-400'}`}>
              {emailError || 'Please enter a valid email address'}
            </p>
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
              onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
            <p className={`text-xs ${passwordError ? 'text-red-400' : 'text-slate-400'}`}>
              {passwordError || 'Must be 8+ chars with uppercase, lowercase, number and special char.'}
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-600 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { 
                setConfirmPassword(e.target.value);
                setConfirmError(e.target.value && e.target.value !== password ? 'Passwords do not match' : '');
              }}
              placeholder="Re-enter your password"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
            <p className={`text-xs ${confirmError ? 'text-red-400' : 'text-slate-400'}`}>
              {confirmError || 'Please re-enter the same password'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!!passwordError || !!emailError || !!confirmError || !password || !confirmPassword || !firstName || !lastName || !email}
            className={`w-full py-2 rounded-2xl font-semibold transition-ease-linear duration-300 ${
              (!!passwordError || !!emailError || !!confirmError || !password || !confirmPassword || !firstName || !lastName || !email)
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] hover:cursor-pointer'
            }`}
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-slate-500 text-sm mb-7">
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