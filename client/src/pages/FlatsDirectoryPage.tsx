import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FlatItem } from '../types';
import { DueStatusBadge } from '../components/common/Badge';
import { EditFlatModal } from '../components/flats/EditFlatModal';
import { Phone, Mail, Edit2 } from 'lucide-react';

export const FlatsDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState<FlatItem[]>([]);
  const [activeFlatForEdit, setActiveFlatForEdit] = useState<FlatItem | null>(null);

  const loadFlats = async () => {
    try {
      const res = await api.flats.getAll();
      if (res.success) {
        setFlats(res.flats);
      }
    } catch (err) {
      console.error('Failed to load flats:', err);
    }
  };

  useEffect(() => {
    loadFlats();
  }, []);

  const floors = [4, 3, 2, 1];
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Units Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            4 Floors • {flats.length || 24} Units • 1 Shared Terrace • Resident Details
          </p>
        </div>

        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
          {flats.length || 24}/{flats.length || 24} Units Occupied
        </span>
      </div>

      {/* Shared Terrace Asset Header */}
      <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Top Floor: Shared Terrace & Assets
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Water tanks, lift machine room, solar panels • Gate hours: 6 AM – 10 PM
          </p>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          Common Asset
        </span>
      </div>

      {/* Building Floors Layout */}
      <div className="space-y-5">
        {floors.map((floor) => {
          const floorFlats = flats.filter(f => f.floorNumber === floor);
          return (
            <div key={floor} className="space-y-2.5">
              <div className="flex items-center gap-2 px-0.5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Floor {floor} ({floorFlats.length} Units)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {floorFlats.map((flat) => {
                  const latestDue = flat.dues?.[0];
                  const isMyFlat = user?.flat && flat.id === user.flat.id;
                  return (
                    <div
                      key={flat.id}
                      className={`p-4 rounded-lg bg-white dark:bg-zinc-900 border transition flex flex-col justify-between space-y-3 ${
                        isMyFlat
                          ? 'border-zinc-400 dark:border-zinc-600 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Unit & Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Flat {flat.unitNumber}</span>
                            {isMyFlat && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                You
                              </span>
                            )}
                          </div>
                          {/* Maintenance status: strictly restricted so only Admin (or flat occupant) sees due status */}
                          {(isAdmin || isMyFlat) && latestDue && (
                            <DueStatusBadge status={latestDue.status} />
                          )}
                        </div>

                        {/* Resident info */}
                        <div className="space-y-1 text-xs">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200">
                            {flat.resident?.fullName || 'Occupant'}
                          </p>

                          {flat.resident?.phone && (
                            <p className="flex items-center gap-1 text-zinc-500">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <a href={`tel:${flat.resident.phone}`} className="hover:underline">
                                {flat.resident.phone}
                              </a>
                            </p>
                          )}

                          {flat.resident?.email && (
                            <p className="flex items-center gap-1 text-zinc-500 text-[11px] truncate">
                              <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{flat.resident.email}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 flex justify-between">
                          <span>Super Built-Up:</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{flat.superBuiltUpSqFt} sq. ft.</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      {isAdmin && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveFlatForEdit(flat)}
                            className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Unit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {activeFlatForEdit && (
        <EditFlatModal
          isOpen={Boolean(activeFlatForEdit)}
          onClose={() => setActiveFlatForEdit(null)}
          flat={activeFlatForEdit}
          onSuccess={loadFlats}
        />
      )}
    </div>
  );
};
