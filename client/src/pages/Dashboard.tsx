import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MaintenanceDue,
  FinancialSummary,
  Complaint,
  Notice,
  MaintenanceConfig
} from '../types';
import { DueStatusBadge, ComplaintStatusBadge, PriorityBadge } from '../components/common/Badge';
import { WhatsAppShareButton } from '../components/notices/WhatsAppShareButton';
import { PayDueModal } from '../components/finance/PayDueModal';
import { NewComplaintModal } from '../components/complaints/NewComplaintModal';
import {
  AlertTriangle,
  ArrowRight,
  Download,
  Plus,
  ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [myDue, setMyDue] = useState<MaintenanceDue | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const loadData = async () => {
    try {
      const [sumRes, duesRes, compRes, notRes, confRes] = await Promise.all([
        api.finance.getSummary('2026-10'),
        api.finance.getDues({ period: '2026-10' }),
        api.complaints.getAll(),
        api.notices.getAll(),
        api.finance.getConfig()
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (notRes.success) setNotices(notRes.notices);
      if (compRes.success) setComplaints(compRes.complaints);
      if (confRes.success) setConfig(confRes.config);

      if (duesRes.success && duesRes.dues.length > 0) {
        if (user?.role === 'RESIDENT' && user.flat) {
          const found = duesRes.dues.find(d => d.flatId === user.flat?.id);
          setMyDue(found || null);
        } else {
          setMyDue(duesRes.dues[0]);
        }
      }

      if (user?.role === 'ADMIN') {
        const regRes = await api.auth.getPendingRegistrations();
        if (regRes.success) {
          setPendingRegistrations(regRes.registrations);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleReviewRegistration = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.auth.reviewRegistration(userId, action);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to review registration');
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const urgentNotice = notices.find(n => n.priority === 'URGENT');

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Urgent Notice Banner */}
      {urgentNotice && (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                    Urgent Notice
                  </span>
                  <span className="text-xs text-rose-400">•</span>
                  <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">{urgentNotice.title}</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                  {urgentNotice.content}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <WhatsAppShareButton notice={urgentNotice} />
            </div>
          </div>
        </div>
      )}

      {/* 1b. Admin Approval Notification Banner */}
      {user?.role === 'ADMIN' && pendingRegistrations.length > 0 && (
        <div className="rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                Pending Resident Registrations ({pendingRegistrations.length})
              </h3>
            </div>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Requires Unit Occupancy Verification
            </span>
          </div>

          <div className="space-y-2">
            {pendingRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {reg.fullName}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                      Flat {reg.flat?.unitNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium">
                      {reg.occupancyType === 'TENANT' ? 'Tenant Occupant' : 'Property Owner'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Mobile: {reg.phone} • Email: {reg.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReviewRegistration(reg.id, 'APPROVE')}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition"
                  >
                    Approve Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewRegistration(reg.id, 'REJECT')}
                    className="px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {user?.role === 'ADMIN'
              ? 'Building Administrator • 24 Units'
              : user?.flat
              ? `Flat ${user.flat.unitNumber} (${user.flat.superBuiltUpSqFt} sq. ft.)`
              : 'Maintenance Staff'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'RESIDENT' && myDue && (
            <>
              {myDue.status === 'PAID' && myDue.payment?.receiptNumber ? (
                <a
                  href={`/api/v1/finance/receipts/${myDue.payment.receiptNumber}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Receipt</span>
                </a>
              ) : myDue.status === 'PENDING' ? (
                <button
                  type="button"
                  onClick={() => setShowPayModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
                >
                  <span>Pay Maintenance (₹{Number(myDue.totalDue).toLocaleString('en-IN')})</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowComplaintModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setActiveTab('dues')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              <span>Manage Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Metrics Cards (Role-aware: Collection stats strictly for Admin only) */}
      {user?.role === 'ADMIN' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Dues Collected</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              ₹ {(summary?.totalCollected || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {summary?.paidCount || 0} of {summary?.totalFlats || 12} units paid
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Outstanding Dues</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              ₹ {(summary?.totalOutstanding || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {summary?.pendingCount || 0} units left to pay
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Society Expenses</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              ₹ {(summary?.totalExpenses || 0).toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mt-1 inline-flex items-center gap-1"
            >
              <span>View ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Open Tickets</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {complaints.filter(c => c.status !== 'CLOSED').length}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {complaints.filter(c => c.priority === 'HIGH' || c.priority === 'EMERGENCY').length} urgent attention
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500">My Maintenance Fee</p>
              {myDue && <DueStatusBadge status={myDue.status} />}
            </div>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {myDue ? `₹ ${Number(myDue.totalDue).toLocaleString('en-IN')}` : '—'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {myDue?.status === 'PAID'
                ? 'October fee paid & verified'
                : myDue?.status === 'SUBMITTED_FOR_VERIFICATION'
                ? 'Payment under verification'
                : 'Due by 5th of this month'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">My Unit Standing</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {user?.flat ? `Flat ${user.flat.unitNumber}` : 'Resident'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {user?.flat ? `Floor ${user.flat.floorNumber} • ${user.flat.superBuiltUpSqFt} sq.ft.` : 'Royal Orchid'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Society Expenses</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              ₹ {(summary?.totalExpenses || 0).toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mt-1 inline-flex items-center gap-1"
            >
              <span>View ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500">Open Tickets</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {complaints.filter(c => c.status !== 'CLOSED').length}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {user?.flat
                ? `${complaints.filter(c => c.flatId === user.flat?.id && c.status !== 'CLOSED').length} open from your unit`
                : 'Building maintenance tickets'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Action Queue for Admin */}
      {user?.role === 'ADMIN' && (summary?.pendingVerificationCount || 0) > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              {summary?.pendingVerificationCount} resident payment(s) awaiting verification
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Verify UTR numbers against the society bank statement to issue receipts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('dues')}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 text-white hover:bg-amber-500 transition"
          >
            Review
          </button>
        </div>
      )}

      {/* 5. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table/List */}
        <div className="lg:col-span-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Maintenance Tickets</h2>
            <button
              type="button"
              onClick={() => setActiveTab('complaints')}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all ({complaints.length})
            </button>
          </div>

          {complaints.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No active tickets.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {complaints.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-zinc-500">#{c.ticketNumber}</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Flat {c.flat.unitNumber}</span>
                      <PriorityBadge priority={c.priority} />
                      <ComplaintStatusBadge status={c.status} />
                    </div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{c.title}</p>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{c.description}</p>
                  </div>

                  <span className="text-[11px] text-zinc-400 shrink-0">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Building Operations & Contacts */}
        <div className="space-y-4">
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Common Area Status
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex justify-between font-medium text-zinc-800 dark:text-zinc-200">
                  <span>Overhead Water Tank</span>
                  <span className="text-zinc-500 text-[11px]">Due 18-Oct</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">Quarterly cleaning scheduled.</p>
              </div>

              <div className="p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex justify-between font-medium text-zinc-800 dark:text-zinc-200">
                  <span>Lift AMC Service</span>
                  <span className="text-zinc-500 text-[11px]">Done 04-Oct</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">Monthly check completed by Johnson Lifts.</p>
              </div>

              <div className="p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex justify-between font-medium text-zinc-800 dark:text-zinc-200">
                  <span>Terrace Timings</span>
                  <span className="text-zinc-500 text-[11px]">6 AM – 10 PM</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">Please ensure door is latched after use.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 text-xs">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Building Contacts
            </h3>

            <div className="space-y-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="pt-1.5 first:pt-0 flex justify-between">
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">Ramesh Kumar</p>
                  <p className="text-[10px] text-zinc-400">Electrician & Plumber</p>
                </div>
                <a href="tel:+919811122334" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-mono">
                  +91 98111 22334
                </a>
              </div>

              <div className="pt-1.5 flex justify-between">
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">Rajesh Sharma</p>
                  <p className="text-[10px] text-zinc-400">RWA Secretary</p>
                </div>
                <a href="tel:+919876543210" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-mono">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {myDue && (
        <PayDueModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          due={myDue}
          config={config}
          onSuccess={loadData}
        />
      )}

      <NewComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
