// SIGARAM64 — Auth Context (Firebase Modular SDK)
// Replaces the old local-user mock with real Firebase Auth + Firestore
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  fetchUserById,
  fetchAdminRecord,
  type FirestoreUser,
} from '../firebase/firestoreService';
import type { UserRole } from '../data/users';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AppUser = FirestoreUser & { role: UserRole };

interface AuthContextValue {
  user: AppUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;          // true while Firebase resolves auth state on load
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // spinner until Firebase ready

  // ── Listen to Firebase auth state changes ────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Try to fetch profile from Firestore 'User' collection
        let profile = await fetchUserById(firebaseUser.uid);

        // 2. Determine role:
        //    a) If profile has a role field — use it
        //    b) Check 'admins' collection for admin/manager role
        //    c) Default to 'student'
        let role: UserRole = 'student';

        if (profile?.role && ['student', 'admin', 'manager'].includes(profile.role)) {
          role = profile.role as UserRole;
        } else {
          // Check separate admin collection as fallback
          const adminRecord = await fetchAdminRecord(firebaseUser.uid);
          if (adminRecord) {
            role = adminRecord.role as UserRole || 'admin';
          }
        }

        if (profile) {
          // Build aliases so existing UI components (nav bars, sidebars) work
          const appUser: AppUser = {
            ...profile,
            role,
            // lowercase aliases ↔ Firestore capitalized fields
            name: profile.Name,
            id: profile.uid,
            elo: profile.rating,
            avatar: (profile.Name?.[0] ?? profile.Email?.[0] ?? '?').toUpperCase(),
            district: profile.SchoolDistrict,
            school: profile.SchoolName,
          };
          setUser(appUser);
        } else {
          // Minimal user when Firestore doc is missing
          const email = firebaseUser.email ?? '';
          const displayName = firebaseUser.displayName ?? '';
          setUser({
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            Name: displayName,
            name: displayName,
            Email: email,
            role,
            avatar: (displayName?.[0] ?? email?.[0] ?? '?').toUpperCase(),
          } as AppUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsub; // cleanup listener on unmount
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    // Session-only persistence: user is logged out when browser closes
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email.trim(), password);
    // onAuthStateChanged above handles state update automatically
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  // ── Refresh User ──────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const profile = await fetchUserById(firebaseUser.uid);
      if (profile) {
        const role = profile.role || 'student';
        setUser({
          ...profile,
          role,
          name: profile.Name,
          id: profile.uid,
          elo: profile.rating,
          avatar: (profile.Name?.[0] ?? profile.Email?.[0] ?? '?').toUpperCase(),
          district: profile.SchoolDistrict,
          school: profile.SchoolName,
        } as AppUser);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
