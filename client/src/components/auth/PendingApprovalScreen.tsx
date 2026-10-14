import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Clock, ShieldCheck, RefreshCw, LogOut, Phone, Mail } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const PendingApprovalScreen: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setTimeout(() => setChecking(false), 400);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-6 space-y-5 backdrop-blur-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Royal Orchid
              </h1>
              <p className="text-[11px] text-zinc-500 font-mono">Unit Verification</p>
            </div>
          </div>

          {user?.approvalStatus === 'REJECTED' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <ShieldCheck className="w-3 h-3 text-rose-600" />
              <span>Registration Rejected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>Pending Review</span>
            </span>
          )}
        </div>

        {/* Informative description */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {user?.approvalStatus === 'REJECTED'
              ? 'Registration Not Approved'
              : 'Account Awaiting Administrator Approval'}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {user?.approvalStatus === 'REJECTED' ? (
              <>
                Hello <strong className="text-zinc-900 dark:text-zinc-100">{user?.fullName}</strong>. Your account registration for Flat {user?.flat?.unitNumber || 'selected unit'} was not approved by building management. Please contact the society secretary to verify unit allocation or tenant agreement details.
              </>
            ) : (
              <>
                Welcome, <strong className="text-zinc-900 dark:text-zinc-100">{user?.fullName}</strong>. To protect resident financial privacy and prevent unauthorized access to building ledger data, all new resident accounts must be verified by the building administrator.
              </>
            )}
          </p>
        </div>

        {/* Summary Card */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 p-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-zinc-500">Allocated Unit:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              Flat {user?.flat?.unitNumber || 'Assigned Flat'} (Floor {user?.flat?.floorNumber || '—'})
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-zinc-500">Occupancy Claim:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {user?.occupancyType === 'TENANT' ? 'Tenant' : 'Property Owner'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-zinc-500">Registered Phone:</span>
            <span className="text-zinc-800 dark:text-zinc-200">{user?.phone || '—'}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-zinc-500">Verification Status:</span>
            {user?.approvalStatus === 'REJECTED' ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Rejected by RWA Secretary</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Under Review by RWA Secretary</span>
            )}
          </div>
        </div>

        {/* Security assurance */}
        {user?.approvalStatus === 'REJECTED' ? (
          <div className="p-3 rounded-md bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <p className="font-medium">Verification Request Closed</p>
              <p className="text-[11px] leading-relaxed text-rose-700/80 dark:text-rose-300/80">
                If you believe this rejection was made in error, please reach out to the RWA Secretary office using the contact details below with your lease or possession document.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div className="space-y-1">
              <p className="font-medium">Admin Notification Dispatched</p>
              <p className="text-[11px] leading-relaxed text-blue-700/80 dark:text-blue-300/80">
                Building Administrator Rajesh Sharma has received your unit allocation request. You will be able to access dues, payment receipts, and maintenance tickets as soon as verification is confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Secretary contact for urgent queries */}
        <div className="pt-2 text-xs text-zinc-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <span>RWA Secretary Office:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
              <Phone className="w-3 h-3 text-zinc-400" />
              +91 98765 43210
            </span>
            <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
              <Mail className="w-3 h-3 text-zinc-400" />
              admin@mygate.local
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            disabled={checking}
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Check Approval Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
