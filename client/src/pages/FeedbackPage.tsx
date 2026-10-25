import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Feedback, FeedbackSummary, FeedbackType } from '../types';
import { Star, Bug, Lightbulb, Palette, MessageCircle, Trash2, Filter, Smartphone, Monitor } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.feedback.getAll({
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        minRating: minRatingFilter > 0 ? minRatingFilter : undefined
      });
      if (res.success) {
        setFeedbacks(res.feedbacks);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [categoryFilter, minRatingFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback entry?')) return;
    try {
      await api.feedback.delete(id);
      loadFeedbacks();
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  const getCategoryBadge = (cat: FeedbackType) => {
    switch (cat) {
      case 'BUG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <Bug className="w-3 h-3" />
            <span>Bug</span>
          </span>
        );
      case 'FEATURE_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Lightbulb className="w-3 h-3" />
            <span>Feature</span>
          </span>
        );
      case 'USABILITY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            <Palette className="w-3 h-3" />
            <span>UI / UX</span>
          </span>
        );
      case 'GENERAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <MessageCircle className="w-3 h-3" />
            <span>General</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            User Feedback & Testing Logs
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real user impressions, bug reports, and UX reviews submitted during live testing
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[11px] font-medium text-zinc-500">Total Submissions</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{summary.totalCount}</p>
          </div>
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[11px] font-medium text-zinc-500">Average Rating</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xl font-bold text-amber-500">{summary.avgRating}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(summary.avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[11px] font-medium text-zinc-500">Reported Bugs</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {summary.categoryBreakdown.BUG}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-[11px] font-medium text-zinc-500">Feature Ideas</p>
            <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
              {summary.categoryBreakdown.FEATURE_REQUEST}
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['ALL', 'BUG', 'FEATURE_REQUEST', 'USABILITY', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {cat === 'ALL'
                ? 'All Categories'
                : cat === 'FEATURE_REQUEST'
                ? 'Features'
                : cat === 'USABILITY'
                ? 'UI/UX'
                : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[11px]">Min Rating:</span>
          <select
            value={minRatingFilter}
            onChange={(e) => setMinRatingFilter(Number(e.target.value))}
            className="px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300"
          >
            <option value={0}>All Stars</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={1}>1-2 Stars (Critiques)</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-zinc-400">Loading feedback entries...</div>
      ) : feedbacks.length === 0 ? (
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-xs text-zinc-500 space-y-1">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">No feedback submitted yet</p>
          <p className="text-zinc-400">Feedback submitted by testers using the "Give Feedback" button will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getCategoryBadge(f.category)}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= f.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-200 dark:text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  {f.page && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                      Page: {f.page}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">
                    {new Date(f.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message */}
              <p className="text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap font-normal">
                {f.message}
              </p>

              {/* Author & Device Meta */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-zinc-500">
                <div>
                  Tester:{' '}
                  <strong className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {f.user?.fullName || f.name || 'Anonymous Tester'}
                  </strong>
                  {f.user?.flat && (
                    <span className="ml-1 text-zinc-400 font-mono">({f.user.flat.unitNumber})</span>
                  )}
                  {(f.user?.email || f.email) && (
                    <span className="ml-1.5 text-zinc-400">({f.user?.email || f.email})</span>
                  )}
                </div>

                {f.deviceInfo && (
                  <div className="flex items-center gap-1 text-zinc-400">
                    {f.deviceInfo.toLowerCase().includes('mobile') ? (
                      <Smartphone className="w-3 h-3 shrink-0" />
                    ) : (
                      <Monitor className="w-3 h-3 shrink-0" />
                    )}
                    <span>{f.deviceInfo}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
