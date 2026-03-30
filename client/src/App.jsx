import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import FlightSearch from './pages/FlightSearch';
import PointsManager from './pages/PointsManager';
import Optimizer from './pages/Optimizer';
import Alerts from './pages/Alerts';
import Budget from './pages/Budget';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/flights" element={<FlightSearch />} />
        <Route path="/points" element={<PointsManager />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </Layout>
  );
}
