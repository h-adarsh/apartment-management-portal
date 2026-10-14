import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FlatItem } from '../../types';
import { api } from '../../services/api';
import { AlertCircle } from 'lucide-react';

interface EditFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  flat: FlatItem;
  onSuccess: () => void;
}

export const EditFlatModal: React.FC<EditFlatModalProps> = ({
  isOpen,
  onClose,
  flat,
  onSuccess
}) => {
  const [superBuiltUpSqFt, setSuperBuiltUpSqFt] = useState(flat.superBuiltUpSqFt.toString());
  const [carpetSqFt, setCarpetSqFt] = useState(flat.carpetSqFt?.toString() || '');
  const [fullName, setFullName] = useState(flat.resident?.fullName || '');
  const [phone, setPhone] = useState(flat.resident?.phone || '');
  const [email, setEmail] = useState(flat.resident?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.flats.update(flat.id, {
        superBuiltUpSqFt: Number(superBuiltUpSqFt),
        carpetSqFt: carpetSqFt ? Number(carpetSqFt) : undefined,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update flat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Unit Details — Flat ${flat.unitNumber}`}
      subtitle={`Floor ${flat.floorNumber} • Update unit area or resident contact`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Super Built-Up (sq. ft.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={superBuiltUpSqFt}
              onChange={(e) => setSuperBuiltUpSqFt(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Carpet Area (sq. ft.)
            </label>
            <input
              type="number"
              value={carpetSqFt}
              onChange={(e) => setCarpetSqFt(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <p className="text-xs font-medium text-zinc-500">Primary Resident Info</p>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Resident Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Login Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              />
            </div>
          </div>
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
            {loading ? 'Saving...' : 'Update Unit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
