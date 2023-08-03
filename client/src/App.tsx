import { 
  BrowserRouter, 
  Route, 
  Routes, 
  // Navigate,
} from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import Homepage from './Pages/Homepage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import { useEffect, useState } from 'react';
import FeedPage from './Pages/FeedPage';
import SettingsPage from './Pages/SettingsPage';
import Callback from './Pages/Callback';


const App = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handleResize = () => {
    const screenWidth = window.innerWidth;
    const mobileBreakpoint = 650; // You can adjust this breakpoint as needed

    setIsMobile(screenWidth < mobileBreakpoint);
  };

  useEffect(() => {
    handleResize(); // Check initial screen width on component mount
    window.addEventListener('resize', handleResize); // Add event listener to check on screen resize

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on component unmount
    };
  }, []);



  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage isMobile={isMobile}/>} />
          <Route path="/feed" element={<FeedPage isMobile={isMobile} />} />
          <Route path="/settings" element={<SettingsPage isMobile={isMobile} />} />
          {/* Used when user gets spotify token, handles token stuff then redirects to /profile */}
          <Route path="/callback" element={<Callback />} /> 
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
