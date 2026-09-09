import axios, { AxiosError } from 'axios';
import type {
  Coordinator, Session, StuckThreshold, Vendor, VendorHistory, VendorStage,
} from '../types';

const SESSION_STORAGE_KEY = 'vendor-tracker-user';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

let unauthorizedHandler: (() => void) | null = null;

export class UnauthorizedError extends Error {
  constructor() {
    super('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    this.name = 'UnauthorizedError';
  }
}

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return config;

  try {
    const session = JSON.parse(stored) as Partial<Session>;
    if (typeof session.token === 'string') {
      config.headers.set('Authorization', `Bearer ${session.token}`);
    }
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
      return Promise.reject(new UnauthorizedError());
    }

    const rawMessage = error.response?.data?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join('. ') : rawMessage;
    return Promise.reject(new Error(message ?? 'Không thể kết nối đến máy chủ.'));
  },
);

export const api = {
  coordinators: async () => (await http.get<Coordinator[]>('/auth/coordinators')).data,
  login: async (name: string) => (await http.post<Session>('/auth/login', { name })).data,
  stages: async () => (await http.get<VendorStage[]>('/vendors/stages')).data,
  vendors: async () => (await http.get<Vendor[]>('/vendors')).data,
  stuckThreshold: async () => (await http.get<StuckThreshold>('/vendors/stuck-threshold')).data,
  history: async (id: string) => (await http.get<VendorHistory[]>(`/vendors/${id}/history`)).data,
  updateVendor: async (id: string, payload: { stageId: number; version: number; notes?: string }) =>
    (await http.patch<Vendor>(`/vendors/${id}/stage`, payload)).data,
  updateStuckThreshold: async (thresholdDays: number) =>
    (await http.patch<StuckThreshold>('/vendors/stuck-threshold', { thresholdDays })).data,
};
