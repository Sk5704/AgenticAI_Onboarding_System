// Mock authentication service
import { api } from './api';

const STORAGE_KEY = "vectorx_user";
const OTP_KEY = "vectorx_otp";

export interface UserSession {
  userId: string;
  phone: string;
  name?: string;
  applicationId?: string;
  applicationStatus: "not_started" | "in_progress" | "pending_verification" | "under_review" | "approved" | "rejected";
  applicationStep: number;
  documents: {
    pan: "pending" | "verified" | "not_uploaded";
    aadhaar: "pending" | "verified" | "not_uploaded";
    addressProof: "pending" | "verified" | "not_uploaded";
    selfie: "pending" | "verified" | "not_uploaded";
  };
  kycStatus: "pending" | "completed";
  complianceStatus: "pending" | "completed";
  riskAssessment: "pending" | "completed";
  finalApproval: "pending" | "completed";
}

const DEFAULT_SESSION: Omit<UserSession, "userId" | "phone"> = {
  applicationStatus: "under_review",
  applicationStep: 3,
  documents: {
    pan: "verified",
    aadhaar: "verified",
    addressProof: "pending",
    selfie: "verified",
  },
  kycStatus: "completed",
  complianceStatus: "completed",
  riskAssessment: "pending",
  finalApproval: "pending",
};

export async function sendOtp(phone: string): Promise<{ success: boolean }> {
  try {
    await api.post('/auth/send-otp', { phone });
    return { success: true };
  } catch (err) {
    console.error('sendOtp API failed', err);
    return { success: false };
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return { success: true };
  } catch (err: unknown) {
    const error = err as { response?: { data?: { detail?: string } } };
    return { success: false, error: error.response?.data?.detail || 'Verification failed' };
  }
}

export async function getSessionFromAPI(phone: string): Promise<UserSession | null> {
  try {
    const response = await api.get('/auth/session', { params: { phone } });
    return response.data;
  } catch (err) {
    console.error('getSessionFromAPI failed', err);
    return null;
  }
}

export function getSession(): UserSession | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function initializeSession(phone: string, userId?: string): void {
  const newSession: UserSession = {
    userId: userId || `USR-${phone.slice(-4)}-${Date.now().toString(36)}`,
    phone,
    applicationStatus: "not_started",
    applicationStep: 1,
    documents: {
      pan: "not_uploaded",
      aadhaar: "not_uploaded",
      addressProof: "not_uploaded",
      selfie: "not_uploaded",
    },
    kycStatus: "pending",
    complianceStatus: "pending",
    riskAssessment: "pending",
    finalApproval: "pending",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
}

export function updateSession(updates: Partial<UserSession>): void {
  const session = getSession();
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, ...updates }));
  } else {
    // If no session exists, create one with minimal data
    const newSession: UserSession = {
      userId: updates.userId || `USR-${Date.now().toString(36)}`,
      phone: updates.phone || "",
      applicationStatus: updates.applicationStatus || "not_started",
      applicationStep: updates.applicationStep || 1,
      documents: updates.documents || {
        pan: "not_uploaded",
        aadhaar: "not_uploaded",
        addressProof: "not_uploaded",
        selfie: "not_uploaded",
      },
      kycStatus: updates.kycStatus || "pending",
      complianceStatus: updates.complianceStatus || "pending",
      riskAssessment: updates.riskAssessment || "pending",
      finalApproval: updates.finalApproval || "pending",
      ...updates,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSession();
}
