import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Complaint, ComplaintStatus } from '../../types';
import { api } from '../../services/api';
import { AlertCircle } from 'lucide-react';

interface UpdateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onSuccess: () => void;
}

export const UpdateComplaintModal: React.FC<UpdateComplaintModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSuccess
}) => {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '');
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolutionNotes || '');
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('assignedTo', assignedTo);
      formData.append('resolutionNotes', resolutionNotes);
      if (resolutionFile) {
        formData.append('resolutionPhoto', resolutionFile);
      }

      await api.complaints.update(complaint.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Ticket #${complaint.ticketNumber}`}
      subtitle={`Flat ${complaint.flat.unitNumber} • ${complaint.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
            className="w-full px-2.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
          >
            <option value="OPEN">Open (New)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Assigned Technician / Vendor
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g. Ramesh Kumar (Electrician)"
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Resolution Notes
          </label>
          <textarea
            rows={3}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Work completed, parts replaced, or findings..."
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Completion Proof Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setResolutionFile(e.target.files?.[0] || null)}
            className="text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-zinc-300 dark:file:border-zinc-700 file:text-xs file:font-medium file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
