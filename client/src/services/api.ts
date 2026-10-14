import {
  User,
  MaintenanceConfig,
  MaintenanceDue,
  Expense,
  Complaint,
  Notice,
  FlatItem,
  FinancialSummary
} from '../types';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (data: {
      fullName: string;
      email: string;
      phone: string;
      unitNumber: string;
      superBuiltUpSqFt?: number;
      occupancyType: 'OWNER' | 'TENANT';
      occupantCount: number;
      password: string;
      passwordConfirmation?: string;
    }) =>
      request<{ success: boolean; message: string; user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    logout: () =>
      request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ success: boolean; user: User }>('/auth/me'),
    getBuildingUnits: () =>
      request<{
        success: boolean;
        floors: Array<{ floor: number; units: string[] }>;
      }>('/auth/building-units'),
    getPendingRegistrations: () =>
      request<{
        success: boolean;
        registrations: Array<User & { flat?: any; createdAt?: string }>;
      }>('/auth/admin/pending-registrations'),
    reviewRegistration: (userId: string, action: 'APPROVE' | 'REJECT') =>
      request<{ success: boolean; message: string }>(`/auth/admin/registrations/${userId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action })
      }),
    getDemoAccounts: () =>
      request<{
        success: boolean;
        accounts: Array<{
          email: string;
          fullName: string;
          role: string;
          unitNumber?: string | null;
          defaultPassword: string;
        }>;
      }>('/auth/demo-accounts')
  },

  // Flats
  flats: {
    getAll: () =>
      request<{ success: boolean; flats: FlatItem[] }>('/flats'),
    getById: (id: string) =>
      request<{ success: boolean; flat: FlatItem }>('/flats/' + id),
    update: (id: string, data: any) =>
      request<{ success: boolean; flat: FlatItem }>('/flats/' + id, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
  },

  // Finance
  finance: {
    getConfig: () =>
      request<{ success: boolean; config: MaintenanceConfig }>('/finance/config'),
    updateConfig: (data: Partial<MaintenanceConfig>) =>
      request<{ success: boolean; config: MaintenanceConfig }>('/finance/config', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    getDues: (params?: { period?: string; flatId?: string }) => {
      const q = new URLSearchParams();
      if (params?.period) q.set('period', params.period);
      if (params?.flatId) q.set('flatId', params.flatId);
      return request<{ success: boolean; dues: MaintenanceDue[] }>(`/finance/dues?${q.toString()}`);
    },
    generateMonthlyDues: (billingPeriod: string) =>
      request<{ success: boolean; message: string; count: number }>('/finance/dues/generate', {
        method: 'POST',
        body: JSON.stringify({ billingPeriod })
      }),
    submitPayment: (formData: FormData) =>
      request<{ success: boolean; payment: any; message: string }>('/finance/payments/submit', {
        method: 'POST',
        body: formData
      }),
    verifyPayment: (paymentId: string, data: { status: 'VERIFIED' | 'REJECTED'; rejectionReason?: string }) =>
      request<{ success: boolean; message: string }>('/finance/payments/' + paymentId + '/verify', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    getExpenses: (params?: { category?: string; month?: string }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.month) q.set('month', params.month);
      return request<{ success: boolean; expenses: Expense[] }>(`/finance/expenses?${q.toString()}`);
    },
    createExpense: (formData: FormData) =>
      request<{ success: boolean; expense: Expense }>('/finance/expenses', {
        method: 'POST',
        body: formData
      }),
    deleteExpense: (id: string) =>
      request<{ success: boolean; message: string }>('/finance/expenses/' + id, {
        method: 'DELETE'
      }),
    getSummary: (period?: string) =>
      request<{ success: boolean; summary: FinancialSummary }>(`/finance/summary?period=${period || '2026-10'}`)
  },

  // Complaints
  complaints: {
    getAll: (params?: { status?: string; category?: string; priority?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.category) q.set('category', params.category);
      if (params?.priority) q.set('priority', params.priority);
      return request<{ success: boolean; complaints: Complaint[] }>(`/complaints?${q.toString()}`);
    },
    create: (formData: FormData) =>
      request<{ success: boolean; complaint: Complaint; message: string }>('/complaints', {
        method: 'POST',
        body: formData
      }),
    update: (id: string, formData: FormData) =>
      request<{ success: boolean; complaint: Complaint; message: string }>(`/complaints/${id}`, {
        method: 'PATCH',
        body: formData
      })
  },

  // Notices
  notices: {
    getAll: () =>
      request<{ success: boolean; notices: Notice[] }>('/notices'),
    create: (data: { title: string; content: string; category: string; priority: string; pinned: boolean }) =>
      request<{ success: boolean; notice: Notice }>('/notices', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>('/notices/' + id, {
        method: 'DELETE'
      })
  }
};
