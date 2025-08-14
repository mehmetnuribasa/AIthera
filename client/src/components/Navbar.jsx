import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import logo from '../assets/Logo.png';
import logout from '../assets/logout.png';
import profilePhoto from '../assets/profilePhoto.png';

const Navbar = () => {
  const navigate = useNavigate();

  const { isAuthenticated, setIsAuthenticated} = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await axiosInstance.delete('/auth/logout', {
        headers: {
          Authorization: '', // Clear the Authorization header
        },
      });

      
      localStorage.removeItem('accessToken');
      navigate('/home');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error.response ? error.response.data.message : error.message);
      alert('Logout failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full shadow-sm z-20 overflow-hidden bg-white/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand */}
          <div 
            className="flex items-center hover:cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="Logo" className="h-20 w-20" />
            <span className="text-xl font-bold text-slate-600 ml-[-18px]">AIthera</span>
          </div>

          {/* Right side - Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              // Logged in user navigation
              <>
                <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
                <a href="/profile" className="text-gray-700 hover:text-gray-900 font-medium">Therapy</a>
                <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">Community</a>
                
                {/* Profile picture */}
                <div
                  className="w-13 h-13 rounded-full overflow-hidden hover:cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover scale-130"
                  />
                </div>

                {/* Logout button */}
                <div className="relative group">
                  <button
                    className="hover:cursor-pointer transition ease-linear duration-300"
                    onClick={handleLogout}
                  >
                    <img src={logout} alt="Logout" className="inline-block" />
                  </button>
                  <span className="absolute top-5 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Logout
                  </span>
                </div>
              </>
            ) : (
              // Not logged in user navigation
              <>
                <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
                <a href="/about" className="text-gray-700 hover:text-gray-900 font-medium">About</a>
                <a href="/services" className="text-gray-700 hover:text-gray-900 font-medium">Services</a>
                <a href="/contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</a>
                
                {/* Login button */}
                <button
                    className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full font-medium hover:bg-[var(--color-secondary)] hover:cursor-pointer transition-ease-linear duration-300"
                    onClick={() => navigate('/login')}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;