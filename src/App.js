import { Routes, Route } from 'react-router-dom';
import GoogleLoginComponent from './components/GoogleLoginComponent';
import Home from './container/Home';
function App() {
  return (
    <Routes>
      <Route path='login' element={<GoogleLoginComponent />} />
      <Route path='/*' element={<Home />} />
    </Routes>
  );
}

export default App;
