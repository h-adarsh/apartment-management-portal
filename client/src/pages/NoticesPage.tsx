import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Notice } from '../types';
import { NoticePriorityBadge } from '../components/common/Badge';
import { WhatsAppShareButton } from '../components/notices/WhatsAppShareButton';
import { NewNoticeModal } from '../components/notices/NewNoticeModal';
import { Plus, Pin, Trash2 } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);

  const loadNotices = async () => {
    try {
      const res = await api.notices.getAll();
      if (res.success) {
        setNotices(res.notices);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.notices.delete(id);
      loadNotices();
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Building Notices
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Operational announcements, maintenance schedules, and WhatsApp broadcast
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Notices Feed */}
      {notices.length === 0 ? (
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-xs text-zinc-400">
          No notices published currently.
        </div>
      ) : (
        <div className="space-y-3.5">
          {notices.map((n) => {
            const isUrgent = n.priority === 'URGENT';
            return (
              <div
                key={n.id}
                className={`rounded-lg p-5 border space-y-3 transition ${
                  isUrgent
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                    <NoticePriorityBadge priority={n.priority} />
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                      {n.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 transition"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed whitespace-pre-line">
                    {n.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <span className="text-zinc-400">
                    Issued by {n.publishedBy?.fullName || 'RWA Management'}
                  </span>

                  <WhatsAppShareButton notice={n} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <NewNoticeModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadNotices}
      />
    </div>
  );
};
