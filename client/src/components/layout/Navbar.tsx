import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, ChevronDown, Check, MessageSquarePlus, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFeedback: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFeedback,
  onOpenProfile
}) => {
  const { user, logout, quickSwitchAccount } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [switching, setSwitching] = useState(false);

  const demoAccounts = [
    { email: 'admin@mygate.local', label: 'Admin (Secretary)', role: 'ADMIN', unit: 'Building Admin' },
    { email: 'flat203@mygate.local', label: 'Flat 203 — Adarsh Singh', role: 'RESIDENT', unit: 'Flat 203 (Paid & Verified)' },
    { email: 'flat201@mygate.local', label: 'Flat 201 — Sunil Deshmukh', role: 'RESIDENT', unit: 'Flat 201 (Pending Verification)' },
    { email: 'flat402@mygate.local', label: 'Flat 402 — Kavita Reddy', role: 'RESIDENT', unit: 'Flat 402 (Unpaid + Open Ticket)' },
    { email: 'staff@mygate.local', label: 'Staff — Ramesh Kumar', role: 'STAFF', unit: 'Technician' },
  ];

  const handleSwitch = async (email: string) => {
    setSwitching(true);
    setShowRoleDropdown(false);
    const pwd = email.startsWith('admin') ? 'admin123' : email.startsWith('staff') ? 'staff123' : 'resident123';
    await quickSwitchAccount(email, pwd);
    setSwitching(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'dues', label: user?.role === 'ADMIN' ? 'Dues & Collections' : 'My Dues & Receipts' },
    { id: 'complaints', label: 'Maintenance Tickets' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'notices', label: 'Notices' },
    { id: 'flats', label: 'Units Directory' },
    ...(user?.role === 'ADMIN' ? [{ id: 'feedback', label: 'Tester Feedback' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Royal Orchid
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                24 Units
              </span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2">
            {/* Feedback Trigger Button */}
            <button
              type="button"
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-xs"
              title="Share feedback or report an issue"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Profile Button */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              title="Resident Profile & Security"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              >
                <span className="text-zinc-500 hidden sm:inline">Role:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.role === 'ADMIN' ? 'Admin' : user?.flat ? `Flat ${user.flat.unitNumber}` : user?.role === 'STAFF' ? 'Staff' : user?.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md p-1 z-20">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Switch Role (Testing)
                    </div>
                    <div className="space-y-0.5">
                      {demoAccounts.map((acc) => {
                        const isCurrent = user?.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleSwitch(acc.email)}
                            disabled={switching}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition ${
                              isCurrent
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <div>
                              <p>{acc.label}</p>
                              <p className="text-[10px] text-zinc-400">{acc.unit}</p>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1.5 border-t border-zinc-100 dark:border-zinc-800 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium transition ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
