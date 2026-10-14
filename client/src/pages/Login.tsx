import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, Shield, CheckCircle2, UserPlus, LogIn, ArrowRight, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { BuildingElevationWireframe } from '../components/common/BuildingElevationWireframe';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [email, setEmail] = useState('admin@mygate.local');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register Form States
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('101');
  const [areaSqFt, setAreaSqFt] = useState<number>(1150);
  const [occupancyType, setOccupancyType] = useState<'OWNER' | 'TENANT'>('OWNER');
  const [occupantCount, setOccupantCount] = useState<number>(2);
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  const floorUnitsMap: Record<number, string[]> = {
    1: ['101', '102', '103', '104', '105', '106'],
    2: ['201', '202', '203', '204', '205', '206'],
    3: ['301', '302', '303', '304', '305', '306'],
    4: ['401', '402', '403', '404', '405', '406'],
  };

  const defaultUnitAreaMap: Record<string, number> = {
    '101': 1150, '102': 1200, '103': 980, '104': 1150, '105': 1200, '106': 980,
    '201': 1150, '202': 1200, '203': 980, '204': 1150, '205': 1200, '206': 980,
    '301': 1150, '302': 1200, '303': 980, '304': 1150, '305': 1200, '306': 980,
    '401': 1150, '402': 1200, '403': 980, '404': 1150, '405': 1200, '406': 980,
  };

  const handleFloorChange = (floor: number) => {
    setSelectedFloor(floor);
    const units = floorUnitsMap[floor] || [];
    if (units.length > 0) {
      setSelectedUnit(units[0]);
      setAreaSqFt(defaultUnitAreaMap[units[0]] || 1150);
    }
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    setAreaSqFt(defaultUnitAreaMap[unit] || 1150);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (regPassword !== regPasswordConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await register({
        fullName,
        email: regEmail,
        phone,
        unitNumber: selectedUnit,
        superBuiltUpSqFt: Number(areaSqFt),
        occupancyType,
        occupantCount,
        password: regPassword,
        passwordConfirmation: regPasswordConfirm
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoPresets = [
    {
      role: 'Admin (RWA Secretary)',
      email: 'admin@mygate.local',
      pwd: 'admin123',
      sub: 'Manage flats, verify UTR payments, record expenses, broadcast notices'
    },
    {
      role: 'Resident — Flat 203 (Adarsh Singh)',
      email: 'flat203@mygate.local',
      pwd: 'resident123',
      sub: 'October dues Paid & Verified • Download PDF receipt'
    },
    {
      role: 'Resident — Flat 201 (Sunil Deshmukh)',
      email: 'flat201@mygate.local',
      pwd: 'resident123',
      sub: 'Payment submitted • Awaiting admin verification'
    },
    {
      role: 'Resident — Flat 402 (Kavita Reddy)',
      email: 'flat402@mygate.local',
      pwd: 'resident123',
      sub: 'Dues unpaid • Has open plumbing ticket'
    },
    {
      role: 'Maintenance Staff (Ramesh Kumar)',
      email: 'staff@mygate.local',
      pwd: 'staff123',
      sub: 'View assigned electrical & plumbing complaints, update status'
    }
  ];

  const handleSelectPreset = (pEmail: string, pPwd: string) => {
    setEmail(pEmail);
    setPassword(pPwd);
    setError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN: Architectural 4-Tier Building Elevation Blueprint */}
        <div className="lg:col-span-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs space-y-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700">
                ARCHITECTURAL PROFILE
              </span>
              <span className="text-[11px] font-mono text-zinc-400">G + 4 FLOORS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              <span>Royal Orchid</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Boutique residential community • 24 Units across 4 floors + 1 common terrace
            </p>
          </div>

          {/* Elevation Schematic SVG */}
          <div className="py-2 flex justify-center bg-zinc-50/50 dark:bg-zinc-950/40 rounded-lg border border-zinc-100 dark:border-zinc-800/80">
            <BuildingElevationWireframe className="w-full max-w-[310px]" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">4</p>
              <p>Floors</p>
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">24</p>
              <p>Units</p>
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">1</p>
              <p>Terrace</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In / Registration Form */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs p-6 space-y-4">
          {/* Auth Mode Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
                authMode === 'login'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 border-b-2 ${
                authMode === 'register'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Resident Register</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= MODE: SIGN IN ================= */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <div className="pb-1">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sign in to your account</h2>
                <p className="text-xs text-zinc-500">Access maintenance dues, tickets, and building ledger.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="flat203@mygate.local"
                    className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-md text-xs sm:text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* Quick Demo Selector */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Quick Demo Accounts
                </p>
                <div className="space-y-1">
                  {demoPresets.map((p) => {
                    const isSelected = email === p.email;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        onClick={() => handleSelectPreset(p.email, p.pwd)}
                        className={`w-full text-left p-2 rounded-md text-xs transition border ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                            : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <p className="font-medium">{p.role}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{p.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODE: REGISTRATION ================= */}
          {authMode === 'register' && (
            <div className="space-y-3.5">
              <div className="pb-1">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resident Self-Registration</h2>
                <p className="text-xs text-zinc-500">Provide contact details to request unit access.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adarsh Singh"
                    className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                  />
                </div>

                {/* Email and Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="resident@example.com"
                      className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98201 10000"
                      className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                    />
                  </div>
                </div>

                {/* Floor, Flat & Manual Area Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      1. Floor <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedFloor}
                        onChange={(e) => handleFloorChange(Number(e.target.value))}
                        className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs cursor-pointer transition"
                      >
                        <option value={1}>Floor 1</option>
                        <option value={2}>Floor 2</option>
                        <option value={3}>Floor 3</option>
                        <option value={4}>Floor 4</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      2. Flat <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedUnit}
                        onChange={(e) => handleUnitChange(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs cursor-pointer transition"
                      >
                        {(floorUnitsMap[selectedFloor] || []).map((u) => (
                          <option key={u} value={u}>
                            Flat {u}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      3. Area <span className="text-zinc-400 font-normal">(sq. ft.)</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={200}
                      max={10000}
                      value={areaSqFt}
                      onChange={(e) => setAreaSqFt(Number(e.target.value))}
                      placeholder="e.g. 1150"
                      className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                    />
                  </div>
                </div>

                {/* Owner / Tenant Claim & Resident Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Occupancy Claim <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOccupancyType('OWNER')}
                        className={`py-2 text-xs rounded-md border text-center transition font-medium shadow-xs ${
                          occupancyType === 'OWNER'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                            : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => setOccupancyType('TENANT')}
                        className={`py-2 text-xs rounded-md border text-center transition font-medium shadow-xs ${
                          occupancyType === 'TENANT'
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                            : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        Tenant
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Residents in Flat <span className="text-zinc-400 text-[10px]">(Total People)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={occupantCount}
                        onChange={(e) => setOccupantCount(Number(e.target.value))}
                        className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs cursor-pointer transition"
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 Persons</option>
                        <option value={3}>3 Persons</option>
                        <option value={4}>4 Persons</option>
                        <option value={5}>5+ Persons</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3.5 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 shadow-xs transition"
                    />
                  </div>
                </div>

                {/* Security Badge */}
                <div className="p-2.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 mt-0.5 text-zinc-500 shrink-0" />
                  <p className="leading-snug">
                    <strong className="text-zinc-800 dark:text-zinc-200">Admin Approval Required:</strong> Your request will be queued for RWA Secretary verification. Assigned role is strictly <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">Resident</span>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-md text-xs sm:text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Submitting registration...' : 'Submit Resident Registration'}</span>
                  {!loading && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
