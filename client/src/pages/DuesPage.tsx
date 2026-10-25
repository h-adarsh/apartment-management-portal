import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getReceiptUrl } from '../services/api';
import { MaintenanceDue, MaintenanceConfig } from '../types';
import { DueStatusBadge } from '../components/common/Badge';
import { PayDueModal } from '../components/finance/PayDueModal';
import { VerifyPaymentModal } from '../components/finance/VerifyPaymentModal';
import { Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const DuesPage: React.FC = () => {
  const { user } = useAuth();
  const [dues, setDues] = useState<MaintenanceDue[]>([]);
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');

  // Modals
  const [activeDueForPayment, setActiveDueForPayment] = useState<MaintenanceDue | null>(null);
  const [activeDueForVerify, setActiveDueForVerify] = useState<MaintenanceDue | null>(null);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [batchPeriodInput, setBatchPeriodInput] = useState('2026-11');
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [duesRes, confRes] = await Promise.all([
        api.finance.getDues({ period: selectedPeriod }),
        api.finance.getConfig()
      ]);

      if (duesRes.success) setDues(duesRes.dues);
      if (confRes.success) setConfig(confRes.config);
    } catch (err) {
      console.error('Failed to load dues:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod, user]);

  const handleGenerateBatch = async () => {
    if (!window.confirm(`Generate dues for all units for period ${batchPeriodInput}?`)) {
      return;
    }

    setGeneratingBatch(true);
    setBatchMessage(null);
    try {
      const res = await api.finance.generateMonthlyDues(batchPeriodInput);
      setBatchMessage(`Generated dues for ${res.count} units`);
      setSelectedPeriod(batchPeriodInput);
      loadData();
    } catch (err: any) {
      setBatchMessage(`Error: ${err.message}`);
    } finally {
      setGeneratingBatch(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const myFlatDue = dues.find(d => d.flatId === user?.flat?.id) || dues[0];
  const pendingVerifications = dues.filter(d => d.status === 'SUBMITTED_FOR_VERIFICATION');

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isAdmin ? 'Maintenance Billing & Collections' : 'My Dues & Receipts'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Formula: ₹{Number(config?.baseFixedCharge || 500).toFixed(0)} base + (Area × ₹{Number(config?.ratePerSqFt || 2.50).toFixed(2)}/sq.ft.)
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
          >
            <option value="2026-10">October 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-09">September 2026</option>
          </select>
        </div>
      </div>

      {/* RESIDENT VIEW: Clean Unit Card */}
      {!isAdmin && myFlatDue && (
        <div className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Flat {myFlatDue.flat.unitNumber}</span>
                <DueStatusBadge status={myFlatDue.status} />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Floor {myFlatDue.flat.floorNumber} • Super Built-Up: {myFlatDue.areaSqFt} sq. ft.
              </p>
            </div>

            <div>
              <span className="text-xs text-zinc-500 block sm:text-right">Total Due</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                ₹ {Number(myFlatDue.totalDue).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500">Fixed Base Fee</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">₹ {Number(myFlatDue.fixedCharge).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-zinc-500">Variable Fee</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                ₹ {Number(myFlatDue.variableCharge).toFixed(2)} ({myFlatDue.areaSqFt} sq. ft. × ₹{Number(myFlatDue.sqFtRate).toFixed(2)})
              </p>
            </div>
            <div>
              <span className="text-zinc-500">Due Date</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {new Date(myFlatDue.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div>
              {myFlatDue.status === 'PAID' && myFlatDue.payment && (
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified on {new Date(myFlatDue.payment.verifiedAt || '').toLocaleDateString('en-IN')}
                  </span>
                  <p className="mt-0.5 font-mono text-[11px]">UTR: {myFlatDue.payment.utrNumber} • Receipt: {myFlatDue.payment.receiptNumber}</p>
                </div>
              )}

              {myFlatDue.status === 'SUBMITTED_FOR_VERIFICATION' && myFlatDue.payment && (
                <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>UTR submitted ({myFlatDue.payment.utrNumber}). Verification in progress.</span>
                </div>
              )}

              {myFlatDue.status === 'PENDING' && myFlatDue.payment?.verificationStatus === 'REJECTED' && (
                <div className="space-y-1">
                  <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Previous Payment Rejected by Admin</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    <strong className="text-rose-700 dark:text-rose-300">Feedback:</strong> {myFlatDue.payment.rejectionReason}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Previous UTR: {myFlatDue.payment.utrNumber}
                    {myFlatDue.payment.verifiedBy && ` • Reviewed by ${myFlatDue.payment.verifiedBy.fullName}`}
                  </p>
                </div>
              )}

              {myFlatDue.status === 'PENDING' && myFlatDue.payment?.verificationStatus !== 'REJECTED' && (
                <div className="text-xs text-zinc-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Due is pending payment.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {myFlatDue.status === 'PAID' && myFlatDue.payment?.receiptNumber && (
                <a
                  href={getReceiptUrl(myFlatDue.payment.receiptNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </a>
              )}

              {myFlatDue.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => setActiveDueForPayment(myFlatDue)}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition ${
                    myFlatDue.payment?.verificationStatus === 'REJECTED'
                      ? 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200'
                  }`}
                >
                  {myFlatDue.payment?.verificationStatus === 'REJECTED' ? 'Resubmit Payment Details' : 'Pay via UPI'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW: Verification Queue */}
      {isAdmin && pendingVerifications.length > 0 && (
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Pending Verifications ({pendingVerifications.length})
            </h2>
            <span className="text-[11px] text-zinc-400">Match against bank statement</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingVerifications.map((due) => (
              <div key={due.id} className="p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Flat {due.flat.unitNumber} ({due.flat.resident?.fullName})</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">₹ {Number(due.totalDue).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-zinc-500 font-mono text-[11px]">UTR: {due.payment?.utrNumber}</p>
                <button
                  type="button"
                  onClick={() => setActiveDueForVerify(due)}
                  className="w-full py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Inspect & Verify
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN VIEW: Batch Generation */}
      {isAdmin && (
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Generate Batch Dues</h3>
            <p className="text-xs text-zinc-500">Auto-generates pro-rated dues for all 24 units.</p>
            {batchMessage && <p className="text-xs text-emerald-600 mt-1">{batchMessage}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="month"
              value={batchPeriodInput}
              onChange={(e) => setBatchPeriodInput(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
            />
            <button
              type="button"
              disabled={generatingBatch}
              onClick={handleGenerateBatch}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              {generatingBatch ? 'Generating...' : 'Generate Batch'}
            </button>
          </div>
        </div>
      )}

      {/* RESIDENT VIEW: Society Bank Account & Payment Instructions */}
      {!isAdmin && config && (
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Official RWA Bank & UPI Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-0.5">
              <span className="text-zinc-500 text-[11px]">Bank Account</span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{config.bankAccountName}</p>
              <p className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">{config.bankAccountNumber}</p>
              <p className="font-mono text-zinc-400 text-[10px]">IFSC: {config.bankIfscCode}</p>
            </div>
            <div className="p-3 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-0.5">
              <span className="text-zinc-500 text-[11px]">Direct UPI VPA</span>
              <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-[12px]">{config.upiId}</p>
              <p className="text-zinc-400 text-[10px]">Scan & Pay via GPay, PhonePe, Paytm</p>
            </div>
            <div className="p-3 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-0.5">
              <span className="text-zinc-500 text-[11px]">Payment Note</span>
              <p className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                Due by 5th of every month. Please submit your 12-digit UTR reference number after payment for instant verification and automated receipt generation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ONLY: Building Dues Registry Table */}
      {isAdmin && (
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Building Dues Ledger ({dues.length || 24} Units)
            </h2>
            <span className="text-xs text-zinc-400">
              {dues.filter(d => d.status === 'PAID').length} of {dues.length} Units Paid
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3.5">Unit</th>
                  <th className="py-2.5 px-3.5">Resident</th>
                  <th className="py-2.5 px-3.5">Area (sq.ft.)</th>
                  <th className="py-2.5 px-3.5">Base + Variable</th>
                  <th className="py-2.5 px-3.5">Total Due</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {dues.map((due) => {
                  return (
                    <tr key={due.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                        Flat {due.flat.unitNumber}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400">
                        {due.flat.resident?.fullName || 'Occupant'}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-500">
                        {due.areaSqFt}
                      </td>
                      <td className="py-2.5 px-3.5 text-zinc-500 font-mono text-[11px]">
                        ₹{Number(due.fixedCharge)} + ₹{Number(due.variableCharge).toFixed(0)}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                        ₹ {Number(due.totalDue).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <DueStatusBadge status={due.status} />
                          {due.payment?.verificationStatus === 'REJECTED' && (
                            <span
                              className="text-[10px] text-rose-600 dark:text-rose-400 font-medium cursor-help"
                              title={`Payment rejected: ${due.payment.rejectionReason || 'Invalid details'}`}
                            >
                              Rejected claim ({due.payment.utrNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        {due.status === 'SUBMITTED_FOR_VERIFICATION' ? (
                          <button
                            type="button"
                            onClick={() => setActiveDueForVerify(due)}
                            className="px-2.5 py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            Verify
                          </button>
                        ) : due.status === 'PAID' && due.payment?.receiptNumber ? (
                          <a
                            href={getReceiptUrl(due.payment.receiptNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline"
                          >
                            Receipt
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeDueForPayment && (
        <PayDueModal
          isOpen={Boolean(activeDueForPayment)}
          onClose={() => setActiveDueForPayment(null)}
          due={activeDueForPayment}
          config={config}
          onSuccess={loadData}
        />
      )}

      {activeDueForVerify && (
        <VerifyPaymentModal
          isOpen={Boolean(activeDueForVerify)}
          onClose={() => setActiveDueForVerify(null)}
          due={activeDueForVerify}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
