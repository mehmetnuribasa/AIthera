import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    joinDate: '',
    severityLevel: '',
    totalScore: '',
    totalSessions: '',
    recommendedTherapy: '',
    therapyProgress: 65
  });

  const [activeTab, setActiveTab] = useState('assessment');

  useEffect(() => {
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/current');
        
        setUserData((prevData) => ({
          ...prevData,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          joinDate: response.data.register_date
            ? new Date(response.data.register_date).toLocaleDateString()
            : ''
        }));
      } catch (error) {
        console.error('Failed to fetch user profile:', error.response ? error.response.data.message : error.message);
        alert('Failed to fetch user profile.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
      }
    }
    
    // Fetch user gad7 results
    const fetchGAD7Results = async () => {
      try {
        const response = await axiosInstance.get('/gad7/results');

        setUserData((prevData) => ({
          ...prevData,
          totalScore: response.data[0].totalScore,
          severityLevel: response.data[0].severityLevel,
          totalSessions: response.data[0].total_sessions,          
          recommendedTherapy: response.data[0].recommended_therapy
        }));
      } catch (error) {
        console.error('Failed to fetch GAD-7 results:', error.response ? error.response.data.message : error.message);
        alert('Failed to fetch GAD-7 results.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
      }
    };

    fetchUserProfile();
    fetchGAD7Results();
  }, []);

  // Mock therapy sessions data
  const [therapySessions] = useState([
    { id: 1, date: '2024-01-15', type: 'CBT Session 1', duration: '45 min', status: 'Completed' },
    { id: 2, date: '2024-01-22', type: 'CBT Session 2', duration: '45 min', status: 'Completed' },
    { id: 3, date: '2024-01-29', type: 'CBT Session 3', duration: '45 min', status: 'Scheduled' },
    { id: 4, date: '2024-02-05', type: 'CBT Session 4', duration: '45 min', status: 'Scheduled' },
    { id: 5, date: '2024-02-12', type: 'CBT Session 5', duration: '45 min', status: 'Scheduled' }
  ]);

  

  const getAnxietyLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'minimal': return 'bg-blue-500';
      case 'mild': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAnxietyLevelWidth = (level) => {
    switch (level.toLowerCase()) {
      case 'minimal': return '20%';
      case 'mild': return '40%';
      case 'moderate': return '60%';
      case 'severe': return '80%';
      default: return '0%';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className=" p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-7">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl">
              <img
                src="https://picsum.photos/200"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-500 mb-2">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-slate-500 mb-2">{userData.email}</p>
              <p className="text-slate-400 text-sm mb-4">Member since {userData.joinDate}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
                <span className="text-sm text-slate-500">Total Sessions</span>
                <div className="text-lg font-bold text-slate-500">{userData.totalSessions}</div>
            </div>
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
                <span className="text-sm text-slate-500">Therapy Progress</span>
                <div className="text-lg font-bold text-slate-500">{userData.therapyProgress}%</div>
            </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-5 px-8">
              <button
                onClick={() => setActiveTab('assessment')}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer ${
                  activeTab === 'assessment'
                    ? 'border-[var(--color-secondary)] text-[var(--color-primary)]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Assessment
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-[var(--color-secondary)] text-[var(--color-primary)]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('therapy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer ${
                  activeTab === 'therapy'
                    ? 'border-[var(--color-secondary)] text-[var(--color-primary)]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Therapy Sessions
              </button>
            </nav>
          </div>


          {/* Tab Content */}
          <div className="p-8">

            {activeTab === 'assessment' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-500 mb-7">Your Anxiety Level</h3>
                
                {/* GAD-7 Score Section */}
                <div className="bg-slate-100 rounded-xl p-4 mb-8">
                  <div className="text-sm text-slate-600 mb-1">GAD-7 Score</div>
                  <div className="text-3xl font-bold text-slate-600">{userData.totalScore}</div>
                </div>
                
                {/* Anxiety Level Indicator */}
                <div className="mb-12">
                  <div className="mb-3 text-lg text-slate-500 font-semibold">{userData.severityLevel}</div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full ${getAnxietyLevelColor(userData.severityLevel)}`}
                      style={{ width: getAnxietyLevelWidth(userData.severityLevel) }}
                    ></div>
                  </div>
                </div>
                
                {/* Recommended Therapy Section */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-600 text-md mb-5">Recommended Therapy</h4>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-slate-500 mb-2">{userData.recommendedTherapy}</div>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        CBT is a type of psychotherapy that helps people identify and change negative thinking patterns and behaviors. It's effective for anxiety, depression, and other mental health issues.
                      </p>
                    </div>
                    <div className="w-24 h-24 bg-orange-100 rounded-xl flex items-center justify-center">
                      <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Summary and Call to Action */}
                <div className="text-slate-500 text-sm mb-8">
                  Based on your GAD-7 score, we recommend a Cognitive Behavioral Therapy (CBT) plan. You'll go through 5 CBT sessions tailored to your needs.
                </div>
                
                <div className="text-right">
                  <button className="bg-[var(--color-primary)] text-white px-4 py-4 rounded-xl font-semibold hover:bg-[var(--color-secondary)] hover:cursor-pointer transition ease-linear duration-300">
                    Continue Therapy
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-500 mb-4">Your Progress Overview</h2>
                
                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Anxiety Management</h3>
                    <div className="text-3xl font-bold text-blue-900 mb-2">75%</div>
                    <p className="text-blue-800 text-sm">Improved from last month</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Session Attendance</h3>
                    <div className="text-3xl font-bold text-green-900 mb-2">92%</div>
                    <p className="text-green-800 text-sm">Excellent consistency</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Wellness Score</h3>
                    <div className="text-3xl font-bold text-red-900 mb-2">8.5/10</div>
                    <p className="text-red-800 text-sm">Strong improvement</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'therapy' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-500">Therapy Sessions</h2>
                  <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-secondary)] hover:cursor-pointer transition ease-linear duration-300">
                    Schedule Session
                  </button>
                </div>
                
                <div className="space-y-4">
                  {therapySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{session.id}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-600">{session.type}</h3>
                          <p className="text-slate-500 text-sm">{session.date} • {session.duration}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;