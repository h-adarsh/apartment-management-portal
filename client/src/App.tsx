import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';
import { PendingApprovalScreen } from './components/auth/PendingApprovalScreen';
import { Dashboard } from './pages/Dashboard';
import { DuesPage } from './pages/DuesPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { NoticesPage } from './pages/NoticesPage';
import { FlatsDirectoryPage } from './pages/FlatsDirectoryPage';
import { Building2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-2">
        <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 animate-pulse">
          <Building2 className="w-4 h-4" />
        </div>
        <p className="text-xs text-zinc-500 font-medium">Loading Royal Orchid...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Security gate: Unapproved or rejected resident registrations cannot access private building ledger or tickets
  if (user.approvalStatus === 'PENDING' || user.approvalStatus === 'REJECTED') {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'dues' && <DuesPage />}
        {activeTab === 'complaints' && <ComplaintsPage />}
        {activeTab === 'expenses' && <ExpensesPage />}
        {activeTab === 'notices' && <NoticesPage />}
        {activeTab === 'flats' && <FlatsDirectoryPage />}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Royal Orchid Resident Welfare Association (RWA)</span>
          <span>24 Units • 4 Floors</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
