import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';

axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {

    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/session', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Session check failed:', error);
        
        // Eğer 401 hatası alırsak (Unauthorized)
        if (error.response && error.response.status === 401) {
          try {
            // Refresh token ile yeni access token al
            const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh-token',
              {}, // Refresh token çerezlerde olduğu için body boş olabilir
              { withCredentials: true } // Çerezlerin gönderilmesi için gerekli
            );

            // Yeni access token'ı sakla
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);

            // Yeni token ile session kontrolünü tekrar yap
            const retryResponse = await axios.get('http://localhost:8080/api/auth/session', {
              headers: {
                Authorization: `Bearer ${refreshResponse.data.accessToken}`,
              },
              withCredentials: true,
            });

            setIsAuthenticated(retryResponse.data.isAuthenticated);
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            // Refresh token başarısızsa kullanıcıyı logout yap
            localStorage.removeItem('accessToken');
            // Login sayfasına yönlendir
          }
        } else {
          setIsAuthenticated(false);
        }
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
