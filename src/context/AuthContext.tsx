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
  updateUser,
  fetchUserGames,
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
  games: any[];
  loadingGames: boolean;
  refreshGames: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

function getLocalDateString(dateInput?: any): string {
  let d: Date;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string') {
    d = new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (dateInput && typeof dateInput.toMillis === 'function') {
    d = new Date(dateInput.toMillis());
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    d = dateInput.toDate();
  } else if (dateInput && dateInput.seconds) {
    d = new Date(dateInput.seconds * 1000);
  } else {
    d = new Date();
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // spinner until Firebase ready
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  const refreshGames = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setLoadingGames(true);
      try {
        const gamesData = await fetchUserGames(firebaseUser.uid);
        setGames(gamesData || []);
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoadingGames(false);
      }
    }
  }, []);

  // Fetch games when user is logged in
  useEffect(() => {
    if (user) {
      refreshGames();
    } else {
      setGames([]);
    }
  }, [user, refreshGames]);

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
          let updatedStreak = profile.streak ?? 0;
          
          if (role === 'student') {
            const todayStr = getLocalDateString();
            const lastActivityStr = profile.last_activity ? getLocalDateString(profile.last_activity) : '';
            
            if (!profile.last_activity) {
              updatedStreak = 1;
              await updateUser(firebaseUser.uid, {
                streak: 1,
                last_activity: new Date().toISOString()
              }).catch(err => console.error("Error updating streak:", err));
            } else if (todayStr !== lastActivityStr) {
              const diffDays = getDaysDifference(todayStr, lastActivityStr);
              if (diffDays === 1) {
                updatedStreak = (profile.streak ?? 0) + 1;
              } else if (diffDays > 1) {
                updatedStreak = 1;
              }
              
              if (diffDays >= 1) {
                await updateUser(firebaseUser.uid, {
                  streak: updatedStreak,
                  last_activity: new Date().toISOString()
                }).catch(err => console.error("Error updating streak:", err));
              }
            }
          }

          // Build aliases so existing UI components (nav bars, sidebars) work
          const appUser: AppUser = {
            ...profile,
            streak: updatedStreak,
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
        setGames([]);
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
        let updatedStreak = profile.streak ?? 0;
        
        if (role === 'student') {
          const todayStr = getLocalDateString();
          const lastActivityStr = profile.last_activity ? getLocalDateString(profile.last_activity) : '';
          
          if (!profile.last_activity) {
            updatedStreak = 1;
            await updateUser(firebaseUser.uid, {
              streak: 1,
              last_activity: new Date().toISOString()
            }).catch(err => console.error("Error updating streak:", err));
          } else if (todayStr !== lastActivityStr) {
            const diffDays = getDaysDifference(todayStr, lastActivityStr);
            if (diffDays === 1) {
              updatedStreak = (profile.streak ?? 0) + 1;
            } else if (diffDays > 1) {
              updatedStreak = 1;
            }
            
            if (diffDays >= 1) {
              await updateUser(firebaseUser.uid, {
                streak: updatedStreak,
                last_activity: new Date().toISOString()
              }).catch(err => console.error("Error updating streak:", err));
            }
          }
        }

        setUser({
          ...profile,
          streak: updatedStreak,
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
        games,
        loadingGames,
        refreshGames,
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
