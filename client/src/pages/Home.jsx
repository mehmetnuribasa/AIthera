import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import heroImg from '../assets/dashboardPhoto.avif';
import breathingImg from '../assets/breathingExercises.png';
import groundingImg from '../assets/groundingExercise.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const scrollToContent = () => {
    const contentSection = document.getElementById('content');
    contentSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      // If user is not authenticated, go to login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="h-screen relative shadow-md mx-auto max-w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Meditation Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 bg-black/20">
            <h1 className="text-4xl md:text-5xl max-w-4xl font-extrabold text-white text-center mb-8 drop-shadow-lg">
                Start your personalized AI-powered anxiety therapy journey
            </h1>
            <p className="text-center text-white text-lg mb-10 max-w-2xl drop-shadow">
                AIthera offers a reliable and effective platform for managing anxiety through personalized therapy sessions. Our AI-driven approach ensures you receive the support you need, tailored to your unique needs.
            </p>
            <button
              onClick={handleGetStarted}
              className="text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-2xl hover:bg-[var(--color-secondary)] hover:cursor-pointer transition ease-linear duration-300"
            >
                {isAuthenticated ? 'Go to Profile' : 'Get Started'}
            </button>
          
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <button onClick={scrollToContent} className="text-white hover:text-[var(--color-secondary)] hover:cursor-pointer">
                    <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
      </div>

      {/* Wellness Tips Section */}
      <div id="content" className="mt-12 mx-auto max-w-4xl mb-10">
        <h2 className="text-2xl font-bold mb-8">Wellness Tips</h2>
        
        <div className="flex flex-col gap-8">
          {/* Tip 1 */}
          <div className="flex flex-col md:flex-row items-center shadow-xl rounded-xl p-6 gap-6">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold mb-2">Breathing Exercises for Anxiety Relief</h3>
              <p className="text-slate-500 mb-2">
                Practice deep breathing to calm your mind and reduce anxiety. Inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Repeat as needed.
              </p>
            </div>
            <img src={breathingImg} alt="Breathing Exercise" className="w-40 h-35 rounded-2xl" />
          </div>

          {/* Tip 2 */}
          <div className="flex flex-col md:flex-row items-center shadow-xl rounded-xl p-6 gap-6">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold mb-2">5-4-3-2-1 Grounding Exercise</h3>
              <p className="text-slate-500 mb-2">
                Focus on 5 things you can see, 4 things you can feel, 3 things you can hear, 2 things you can smell, and 1 thing you can taste or think of.
              </p>
            </div>
            <img src={groundingImg} alt="Grounding Exercise" className="w-40 h-35 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;