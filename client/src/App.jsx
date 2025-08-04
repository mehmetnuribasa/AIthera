import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Navbar from './components/Navbar';


function App() {

  return (
    <AuthProvider >
      <Router>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<ProtectedRoute allowPublic={true}><Home /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute allowPublic={true}><Home /></ProtectedRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
