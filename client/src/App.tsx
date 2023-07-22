import { 
  BrowserRouter, 
  Route, 
  Routes, 
  // Navigate,
} from 'react-router-dom';

import Login from './Pages/Login';
import Register from './Pages/Register';
import UserLanding from './Pages/UserLanding';
import Homepage from './Pages/Homepage';

const App = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/user" element={<UserLanding />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
            
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
