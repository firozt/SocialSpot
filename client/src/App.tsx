import { 
  BrowserRouter, 
  Route, 
  Routes, 
  // Navigate,
} from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import UserLanding from './Pages/UserLanding';
import Homepage from './Pages/Homepage';
import RegisterPage from './Pages/RegisterPage';

const App = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/user" element={<UserLanding />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
            
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
