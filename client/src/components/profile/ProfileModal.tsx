import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { User, KeyRound, CheckCircle2, AlertCircle, Phone, Mail, Home } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  // Details state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsError(null);
    setDetailsSuccess(false);

    try {
      await updateProfile({ fullName, phone });
      setDetailsSuccess(true);
      setTimeout(() => setDetailsSuccess(false), 3000);
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to update profile');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Resident Profile"
      subtitle={user.flat ? `Flat ${user.flat.unitNumber} • Floor ${user.flat.floorNumber}` : user.email}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Navigation tabs inside modal */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 pb-2 text-xs font-medium text-center border-b-2 transition ${
              activeTab === 'details'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Account Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 pb-2 text-xs font-medium text-center border-b-2 transition ${
              activeTab === 'security'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Password & Security
          </button>
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            {detailsSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile details saved successfully.</span>
              </div>
            )}
            {detailsError && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{detailsError}</span>
              </div>
            )}

            {/* Readonly Identity Box */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Registered Email</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">System Role</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.role}</span>
              </div>
              {user.flat && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Allocated Unit</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Unit {user.flat.unitNumber} (Floor {user.flat.floorNumber})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Super Built-Up Area</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {user.flat.superBuiltUpSqFt} sq.ft.
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Occupancy Type</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {user.occupancyType || 'OWNER'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Editable Full Name */}
            <div className="space-y-1">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Editable Phone */}
            <div className="space-y-1">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium">
                Mobile Number (for RWA notices)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingDetails}
                className="px-4 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:bg-zinc-800 transition disabled:opacity-50"
              >
                {savingDetails ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3">
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-700 dark:text-zinc-300 font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium hover:bg-zinc-800 transition disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
