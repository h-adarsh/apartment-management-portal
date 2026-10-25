import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquarePlus, CheckCircle2, AlertCircle, Sparkles, Bug, Lightbulb, Palette, MessageCircle } from 'lucide-react';
import { FeedbackType } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentPage = 'General'
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<FeedbackType>('GENERAL');
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>(user?.fullName || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ratingLabels = ['Needs Work', 'Fair', 'Good', 'Very Good', 'Exceptional'];

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const screenWidth = window.innerWidth;
    return `${isMobile ? 'Mobile' : 'Desktop'} (${screenWidth}px) • ${navigator.platform || 'Web'}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setError('Please provide at least a short comment (5+ characters) to help us improve.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.feedback.submit({
        rating,
        category,
        message: message.trim(),
        page: currentPage,
        deviceInfo: getDeviceInfo(),
        name: name.trim() || undefined,
        email: email.trim() || undefined
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    setError(null);
    onClose();
  };

  const categoryOptions: Array<{ type: FeedbackType; label: string; icon: React.ReactNode }> = [
    { type: 'BUG', label: 'Bug / Issue', icon: <Bug className="w-3.5 h-3.5 text-rose-500" /> },
    { type: 'FEATURE_REQUEST', label: 'Feature Request', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> },
    { type: 'USABILITY', label: 'UI / UX', icon: <Palette className="w-3.5 h-3.5 text-sky-500" /> },
    { type: 'GENERAL', label: 'General', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Tester & Resident Feedback"
      subtitle="Help us refine the Royal Orchid apartment experience"
      maxWidth="max-w-md"
    >
      {submitted ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Thank you for your feedback!
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your review and suggestions have been logged and will be used to enhance upcoming updates.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 transition"
            >
              Back to Portal
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rating */}
          <div className="space-y-1.5 text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <label className="block text-[11px] font-medium text-zinc-500">
              How is your experience testing this portal?
            </label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-115 transition transform focus:outline-hidden"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 pt-0.5">
              {ratingLabels[(hoverRating !== null ? hoverRating : rating) - 1]}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="block font-medium text-zinc-700 dark:text-zinc-300">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setCategory(opt.type)}
                  className={`flex items-center gap-2 p-2 rounded-md border text-left text-xs font-medium transition ${
                    category === opt.type
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback message */}
          <div className="space-y-1">
            <label className="block font-medium text-zinc-700 dark:text-zinc-300">
              Your Observations & Suggestions <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What worked well? What felt confusing, broken, or missing? (e.g. 'UPI payment flow was smooth, but ticket photo upload was slow on mobile')"
              className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Tester name / email for follow-up */}
          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Your Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh"
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-0.5">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tester@domain.com"
                  className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                />
              </div>
            </div>
          )}

          {/* Context footer */}
          <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Context: Page <strong>{currentPage}</strong></span>
            <span>Device info auto-attached</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
