import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import FlightSearch from './pages/FlightSearch';
import PointsManager from './pages/PointsManager';
import Optimizer from './pages/Optimizer';
import Alerts from './pages/Alerts';
import Budget from './pages/Budget';
import Status from './pages/Status';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trips" element={<Destinations />} />
        <Route path="/destinations" element={<Navigate to="/trips" replace />} />
        <Route path="/flights" element={<FlightSearch />} />
        <Route path="/points" element={<PointsManager />} />
        <Route path="/status" element={<Status />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </Layout>
  );
}
