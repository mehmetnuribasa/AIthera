import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import axiosInstance from './api/axios'; // Import the configured axios instance
import Home from './pages/Home';
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
      <Router>
          <Navbar isLoggedIn={isAuthenticated} />
        <Routes>
          <Route path="/" element={<h1>Welcome to the AIthera App {isAuthenticated ? 'User is authenticated' : 'User is not authenticated'}</h1>} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
  )
}

export default App;
