import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import axiosInstance from './api/axios'; // Import the configured axios instance
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axiosInstance.get('/auth/session');
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);


  return (
    <AuthProvider >
      <Router>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
