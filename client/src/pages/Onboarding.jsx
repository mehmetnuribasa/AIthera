import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateProfileStatus } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    user_id: '',
    age: '',
    gender: '',
    sleepPattern: '',
    stressLevel: '',
    hasDiagnosis: '',
    usesMedication: '',
    dreamRecallLevel: ''
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try{
        const response = await axiosInstance.get('/auth/current-user');

        setFormData(prev => ({
          ...prev,
          user_id: response.data.userId// Set user_id from the response
        }));

        console.log('User ID fetched successfully:', response.data.userId);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post('/profile', formData);

      console.log('Profile completed successfully:', response.data);
      
      // Update profile status in AuthContext
      if (formData.user_id) {
        await updateProfileStatus(formData.user_id);
      }
      
      navigate('/profile');
    } catch (error) {
      console.error('Profile completion failed:', error.response ? error.response.data.message : error.message);
      alert('Profile completion failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-20">
      <div className="max-w-xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-600 mb-5">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 text-sm">
            To personalize your therapy experience, please provide some details about yourself.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Field */}
          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-slate-600 mb-2">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Gender Field */}
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-slate-600 mb-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Sleep Pattern Field */}
          <div>
            <label htmlFor="sleepPattern" className="block text-sm font-semibold text-slate-600 mb-2">
              Sleep Pattern
            </label>
            <select
              id="sleepPattern"
              name="sleepPattern"
              value={formData.sleepPattern}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Select your sleep pattern</option>
              <option value="regular">Regular (7-8 hours)</option>
              <option value="irregular">Irregular</option>
              <option value="little_sleep">Little sleep (less than 6 hours)</option>
              <option value="too_much_sleep">Too much sleep (more than 9 hours)</option>
              <option value="insomnia">Insomnia problem</option>
            </select>
          </div>

          {/* Daily Stress Level Field */}
          <div>
            <label htmlFor="stressLevel" className="block text-sm font-semibold text-slate-600 mb-2">
              Daily Stress Level (1-10)
            </label>
            <select
              id="stressLevel"
              name="stressLevel"
              value={formData.stressLevel}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Select your stress level</option>
              <option value="1">1 - Very Low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Slightly Low</option>
              <option value="4">4 - Medium-Low</option>
              <option value="5">5 - Medium</option>
              <option value="6">6 - Medium-High</option>
              <option value="7">7 - High</option>
              <option value="8">8 - Very High</option>
              <option value="9">9 - Extremely High</option>
              <option value="10">10 - Maximum</option>
            </select>
          </div>

          {/* Previous Diagnosis Field */}
          <div>
            <label htmlFor="hasDiagnosis" className="block text-sm font-semibold text-slate-600 mb-2">
              Previous Diagnosis
            </label>
            <select
              id="hasDiagnosis"
              name="hasDiagnosis"
              value={formData.hasDiagnosis}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Select your previous diagnosis</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Medication Usage Field */}
          <div>
            <label htmlFor="usesMedication" className="block text-sm font-semibold text-slate-600 mb-2">
              Medication Usage
            </label>
            <select
              id="usesMedication"
              name="usesMedication"
              value={formData.usesMedication}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Do you have any medication usage?</option>
              <option value="evet">Yes</option>
              <option value="hayir">No</option>
            </select>
          </div>

          {/* Dream Recall Level Field */}
          <div>
            <label htmlFor="dreamRecallLevel" className="block text-sm font-semibold text-slate-600 mb-2">
              Dream Recall Level (if any)
            </label>
            <select
              id="dreamRecallLevel"
              name="dreamRecallLevel"
              value={formData.dreamRecallLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 focus:outline-none"
            >
              <option value="">Select your dream recall level</option>
              <option value="don't_remember">I don't remember at all</option>
              <option value="rarely">I rarely remember</option>
              <option value="sometimes">I sometimes remember</option>
              <option value="often">I often remember</option>
              <option value="always">I always remember</option>
              <option value="don't_dream">I don't dream</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-2 mb-3 rounded-2xl font-semibold hover:bg-[var(--color-secondary)] hover:cursor-pointer transition-ease-linear duration-300"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;