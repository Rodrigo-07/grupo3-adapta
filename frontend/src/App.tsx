import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <div>
      <Navbar />
      
      {/* Main content area */}
      <div className='pt-16 bg-cyan-300'>
         <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
     
    </div>
  );
}

export default App;
