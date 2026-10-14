import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Complaint } from '../types';
import { ComplaintStatusBadge, PriorityBadge } from '../components/common/Badge';
import { NewComplaintModal } from '../components/complaints/NewComplaintModal';
import { UpdateComplaintModal } from '../components/complaints/UpdateComplaintModal';
import { Plus, ExternalLink } from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [showNewModal, setShowNewModal] = useState(false);
  const [activeComplaintForUpdate, setActiveComplaintForUpdate] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    try {
      const res = await api.complaints.getAll({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined
      });
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter, user]);

  const handleResidentCloseTicket = async (id: string) => {
    if (!window.confirm('Confirm ticket closure?')) return;
    const formData = new FormData();
    formData.append('status', 'CLOSED');
    formData.append('resolutionNotes', 'Resident confirmed fixed');
    await api.complaints.update(id, formData);
    loadComplaints();
  };

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Maintenance Tickets
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Building repairs, plumbing, electrical, and elevator operations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Minimal Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <option value="ALL">All Categories</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="LIFT">Lift</option>
          <option value="CLEANING">Cleaning</option>
          <option value="TERRACE">Terrace</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Tickets List */}
      {complaints.length === 0 ? (
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-xs text-zinc-500">
          No maintenance tickets found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => {
            const isMyComplaint = user?.flat && c.flatId === user.flat.id;
            return (
              <div
                key={c.id}
                className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-zinc-400">#{c.ticketNumber}</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Flat {c.flat.unitNumber}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <ComplaintStatusBadge status={c.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1">
                    {c.preferredSlot && <p>Preferred slot: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{c.preferredSlot}</strong></p>}
                    {c.assignedTo ? (
                      <p className="text-zinc-700 dark:text-zinc-300">Technician: <strong>{c.assignedTo}</strong></p>
                    ) : (
                      <p className="text-zinc-400">Awaiting technician assignment</p>
                    )}

                    {c.photoUrl && (
                      <a
                        href={c.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
                      >
                        <span>Attached Photo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {c.resolutionNotes && (
                    <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 text-[11px]">Resolution:</p>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{c.resolutionNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <span className="text-zinc-400">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {isStaffOrAdmin && (
                      <button
                        type="button"
                        onClick={() => setActiveComplaintForUpdate(c)}
                        className="px-2.5 py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                      >
                        Update
                      </button>
                    )}

                    {isMyComplaint && c.status === 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleResidentCloseTicket(c.id)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NewComplaintModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadComplaints}
      />

      {activeComplaintForUpdate && (
        <UpdateComplaintModal
          isOpen={Boolean(activeComplaintForUpdate)}
          onClose={() => setActiveComplaintForUpdate(null)}
          complaint={activeComplaintForUpdate}
          onSuccess={loadComplaints}
        />
      )}
    </div>
  );
};
