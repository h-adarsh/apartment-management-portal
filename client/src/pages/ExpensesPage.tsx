import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getFileUrl } from '../services/api';
import { Expense, FinancialSummary } from '../types';
import { AddExpenseModal } from '../components/finance/AddExpenseModal';
import { Plus, ExternalLink } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadExpenses = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        api.finance.getExpenses({
          month: selectedMonth,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined
        }),
        api.finance.getSummary(selectedMonth)
      ]);

      if (expRes.success) setExpenses(expRes.expenses);
      if (sumRes.success) setSummary(sumRes.summary);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedMonth, categoryFilter]);

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'WATER': return 'Water Tanker';
      case 'CLEANING': return 'Cleaning';
      case 'ELECTRICITY': return 'Common Electricity';
      case 'LIFT_AMC': return 'Lift AMC';
      case 'REPAIRS': return 'Repairs';
      default: return 'Misc';
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Society Expenses Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Transparent records of all building operational expenses and vouchers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
          />

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Dues Collected</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ₹ {(summary?.totalCollected || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400">Total monthly resident contributions</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Total Expenses Paid</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ₹ {totalExpenseAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400">Lift, water tankers, cleaning, repairs</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Net Monthly Balance</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ₹ {((summary?.totalCollected || 0) - totalExpenseAmount).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400">Inflow minus operational outflow</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Monthly Common Expenses</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              ₹ {totalExpenseAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-400">Water tankers, lift AMC, cleaning, electricity</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Recorded Vouchers</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {expenses.length} Entries
            </p>
            <p className="text-[11px] text-zinc-400">Vendor bills & verified payment receipts</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-medium">Operational Transparency</span>
            <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              100% Accounted
            </p>
            <p className="text-[11px] text-zinc-400">Shared building expenses audit log</p>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {['ALL', 'WATER', 'CLEANING', 'ELECTRICITY', 'LIFT_AMC', 'REPAIRS', 'MISC'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
              categoryFilter === cat
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {cat === 'ALL' ? 'All' : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Itemized Ledger</h2>
          <span className="text-xs text-zinc-400">{expenses.length} Records</span>
        </div>

        {expenses.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-8">
            No expenses recorded for this month and filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Category</th>
                  <th className="py-2.5 px-3.5">Title</th>
                  <th className="py-2.5 px-3.5">Vendor</th>
                  <th className="py-2.5 px-3.5">Amount</th>
                  <th className="py-2.5 px-3.5">Logged By</th>
                  <th className="py-2.5 px-3.5 text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 px-3.5 text-zinc-500 font-mono text-[11px]">
                      {new Date(e.expenseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {getCategoryLabel(e.category)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {e.title}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-500">
                      {e.vendorName || '—'}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                      ₹ {Number(e.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-500">
                      {e.recordedBy?.fullName.split(' ')[0] || 'Admin'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      {e.billImageUrl ? (
                        <a
                          href={getFileUrl(e.billImageUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Bill</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadExpenses}
      />
    </div>
  );
};
