import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MaintenanceDue } from '../../types';
import { api } from '../../services/api';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface VerifyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  due: MaintenanceDue;
  onSuccess: () => void;
}

export const VerifyPaymentModal: React.FC<VerifyPaymentModalProps> = ({
  isOpen,
  onClose,
  due,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!due.payment) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.finance.verifyPayment(due.payment!.id, { status: 'VERIFIED' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for payment rejection');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.finance.verifyPayment(due.payment!.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify Payment — Flat ${due.flat.unitNumber}`}
      subtitle={`Period: ${due.billingPeriod} • Amount: ₹${Number(due.totalDue).toLocaleString('en-IN')}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Transaction Summary */}
        <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Resident</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{due.flat.resident?.fullName || 'Occupant'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Claimed Amount</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹ {Number(due.payment.amountPaid).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Bank UTR Number</span>
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 select-all">{due.payment.utrNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Submission Date</span>
            <span className="text-zinc-700 dark:text-zinc-300">{new Date(due.payment.paidAt).toLocaleDateString('en-IN')}</span>
          </div>

          {due.payment.proofImageUrl && (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <a
                href={due.payment.proofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View Uploaded Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Choice */}
        {!rejecting ? (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="px-4 py-2 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Approve & Issue Receipt'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleReject} className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR not found on society bank statement"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-500 transition disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
