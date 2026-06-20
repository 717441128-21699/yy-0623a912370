import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import FleetDetail from './pages/FleetDetail';
import Radar from './pages/Radar';
import Profile from './pages/Profile';
import Publish from './pages/Publish';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="fleet/:id" element={<FleetDetail />} />
          <Route path="radar" element={<Radar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="publish" element={<Publish />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
