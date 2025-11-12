import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PackList from './pages/PackList';
import PackDetails from './pages/PackDetails';
import CreatePack from './pages/CreatePack';
import Profile from './pages/Profile';
import MakePayment from './pages/MakePayment';
import PayoutHistory from './pages/PayoutHistory';
import ManageMembers from './pages/ManageMembers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/packs" element={<PackList />} />
        <Route path="/packs/create" element={<CreatePack />} />
        <Route path="/packs/:id" element={<PackDetails />} />
        <Route path="/packs/:packId/payment" element={<MakePayment />} />
        <Route path="/packs/:packId/manage" element={<ManageMembers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payouts" element={<PayoutHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
