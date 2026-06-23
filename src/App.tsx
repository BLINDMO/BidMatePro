import { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './stores/settingsStore';
import { useJobStore } from './stores/jobStore';
import { useClientStore } from './stores/clientStore';
import SplashScreen from './screens/Splash/SplashScreen';
import MainLayout from './components/layout/MainLayout';
import Toast from './components/ui/Toast';
import Spinner from './components/ui/Spinner';

import DashboardScreen from './screens/Dashboard/DashboardScreen';
import JobsListScreen from './screens/Jobs/JobsListScreen';
import JobDetailScreen from './screens/Jobs/JobDetailScreen';
import EstimateBuilderScreen from './screens/Estimate/EstimateBuilderScreen';
import MeasurementToolScreen from './screens/Camera/MeasurementToolScreen';
import MoreScreen from './screens/More/MoreScreen';
import ClientsListScreen from './screens/Clients/ClientsListScreen';
import ClientDetailScreen from './screens/Clients/ClientDetailScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';

// Heavy screens (jsPDF / recharts) are loaded on demand.
const InvoiceScreen = lazy(() => import('./screens/Invoice/InvoiceScreen'));
const ReportsScreen = lazy(() => import('./screens/Reports/ReportsScreen'));
import CompanyInfoScreen from './screens/Settings/CompanyInfoScreen';
import LaborRatesScreen from './screens/Settings/LaborRatesScreen';
import PricingDefaultsScreen from './screens/Settings/PricingDefaultsScreen';
import DocumentSettingsScreen from './screens/Settings/DocumentSettingsScreen';

export default function App() {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadJobs = useJobStore((s) => s.loadJobs);
  const loadClients = useClientStore((s) => s.loadClients);

  useEffect(() => {
    const start = Date.now();
    (async () => {
      await loadSettings();
      await Promise.all([loadJobs(), loadClients()]);
      // Keep splash visible briefly for a smooth boot.
      const elapsed = Date.now() - start;
      setTimeout(() => setReady(true), Math.max(0, 700 - elapsed));
    })();
  }, [loadSettings, loadJobs, loadClients]);

  if (!ready) return <SplashScreen />;

  return (
    <HashRouter>
      <div className="mx-auto min-h-screen max-w-[430px]">
        <Toast />
        <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/jobs" element={<JobsListScreen />} />
            <Route path="/measure" element={<MeasurementToolScreen />} />
            <Route path="/more" element={<MoreScreen />} />
          </Route>

          <Route path="/jobs/:id" element={<JobDetailScreen />} />
          <Route path="/jobs/:id/invoice" element={<InvoiceScreen />} />
          <Route path="/estimate/new" element={<EstimateBuilderScreen />} />
          <Route path="/estimate/:id/edit" element={<EstimateBuilderScreen />} />
          <Route path="/clients" element={<ClientsListScreen />} />
          <Route path="/clients/:id" element={<ClientDetailScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/settings/company" element={<CompanyInfoScreen />} />
          <Route path="/settings/labor" element={<LaborRatesScreen />} />
          <Route path="/settings/pricing" element={<PricingDefaultsScreen />} />
          <Route path="/settings/documents" element={<DocumentSettingsScreen />} />
        </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
}
