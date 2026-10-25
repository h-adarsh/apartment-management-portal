import React, { useState, useEffect } from 'react';
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
import { FeedbackPage } from './pages/FeedbackPage';
import { FeedbackModal } from './components/common/FeedbackModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { Building2, MessageSquarePlus } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Hash-based tab persistence for deep linking & browser back/forward support
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['dashboard', 'dues', 'complaints', 'expenses', 'notices', 'flats', 'feedback'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

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
    return (
      <>
        <Login />
        {/* Floating feedback button for testers on login screen */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold shadow-lg hover:scale-105 transition"
            title="Tester Feedback"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Tester Feedback</span>
          </button>
        </div>
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          currentPage="Login Screen"
        />
      </>
    );
  }

  // Security gate: Unapproved or rejected resident registrations cannot access private building ledger or tickets
  if (user.approvalStatus === 'PENDING' || user.approvalStatus === 'REJECTED') {
    return (
      <>
        <PendingApprovalScreen />
        <div className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold shadow-lg hover:scale-105 transition"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-400" />
            <span>Give Feedback</span>
          </button>
        </div>
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          currentPage="Pending Verification Screen"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'dues' && <DuesPage />}
        {activeTab === 'complaints' && <ComplaintsPage />}
        {activeTab === 'expenses' && <ExpensesPage />}
        {activeTab === 'notices' && <NoticesPage />}
        {activeTab === 'flats' && <FlatsDirectoryPage />}
        {activeTab === 'feedback' && user.role === 'ADMIN' && <FeedbackPage />}
      </main>

      {/* Floating Feedback Button for mobile testers */}
      <div className="fixed bottom-4 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900/90 text-white dark:bg-zinc-100/90 dark:text-zinc-900 text-xs font-medium backdrop-blur-md shadow-lg border border-zinc-700/40"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
          <span>Feedback</span>
        </button>
      </div>

      {/* Global Modals */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        currentPage={activeTab}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Royal Orchid Resident Welfare Association (RWA)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Feedback & Bugs</span>
            </button>
            <span>•</span>
            <span>24 Units • 4 Floors</span>
          </div>
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
