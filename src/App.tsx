import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import OpenCashPage from './pages/OpenCashPage';
import PosPage from './pages/PosPage';
import RestockPage from './pages/RestockPage';
import CloseCashPage from './pages/CloseCashPage';
import AdminPage from './pages/AdminPage';
import { useCashStore } from './stores/cashStore';

function AppRoutes() {
  const loadSession = useCashStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/open" element={<OpenCashPage />} />
      <Route path="/pos" element={<PosPage />} />
      <Route path="/restock" element={<RestockPage />} />
      <Route path="/close" element={<CloseCashPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}
