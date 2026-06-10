// SIGARAM64 — Firestore Service Layer
// All Firestore read/write functions for the new project
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from './firebase';
import type { UserRole } from '../data/users';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// ── TYPES ────────────────────────────────────────────────────────────────────

export interface FirestoreUser {
  uid: string;
  Name: string;
  UserName?: string;
  Email: string;
  role: UserRole;
  Age?: string;
  Country?: string;
  FIDE?: string;
  ProfileImage?: string;
  SchoolName?: string;
  SchoolDistrict?: string;
  rating?: number;
  TotalMatch?: number;
  WinMatch?: number;
  Status?: boolean;
  quizCompleted?: boolean;
  quizScore?: number;
  playerCategory?: string;
  threegameanalysisover?: boolean;
  createdAt?: any;
  loginCount?: number;
  games_played?: number;
  games_won?: number;
  games_lost?: number;
  games_drawn?: number;
  win_rate?: number;
  streak?: number;
  peak_rating?: number;
  aiLevel?: number;
  last_activity?: any;

  // ── Lowercase aliases for UI component compatibility ──────────────────────
  // These mirror the Firestore capitalized fields so existing nav/page
  // components (which use old lowercase field names) work without changes.
  name?: string;      // alias → Name
  id?: string;        // alias → uid
  elo?: number;       // alias → rating
  avatar?: string;    // computed → Name[0] or Email[0]
  district?: string;  // alias → SchoolDistrict
  school?: string;    // alias → SchoolName
  password?: string;  // only present on admin/manager records
}

// ── USER FETCH ────────────────────────────────────────────────────────────────

export function normalizeFirestoreUser(uid: string, data: any): FirestoreUser {
  if (data.createdAt?.toDate) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  // Convert legacy FIDE to rating
  let rating = data.rating;
  if (rating == null && data.FIDE) {
    const parsed = parseInt(data.FIDE, 10);
    if (!isNaN(parsed)) rating = parsed;
  }
  if (rating == null) rating = 1000;

  const games_played = data.games_played ?? data.TotalMatch ?? 0;
  const games_won = data.games_won ?? data.WinMatch ?? 0;

  return {
    ...data,
    uid,
    role: data.role || 'student',
    Name: data.Name || data.name || data.UserName || data.username || '',
    Email: data.Email || data.email || '',
    rating,
    elo: rating, // alias
    games_played,
    TotalMatch: games_played, // alias
    games_won,
    WinMatch: games_won, // alias
    SchoolName: data.SchoolName || data.school || '',
    SchoolDistrict: data.SchoolDistrict || data.district || '',
    Status: data.Status ?? false,
    last_activity: data.last_activity || null,
  } as FirestoreUser;
}

/** Fetch a single user document by UID */
export async function fetchUserById(uid: string): Promise<FirestoreUser | null> {
  try {
    const snap = await getDoc(doc(db, 'User', uid));
    if (snap.exists()) {
      return normalizeFirestoreUser(uid, snap.data());
    }
    return null;
  } catch (err) {
    console.error('fetchUserById error:', err);
    return null;
  }
}

/** Fetch all games for a specific user */
export async function fetchUserGames(uid: string): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'User', uid, 'games'));
    // Sort games by date played if available, fallback to id
    const games: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return games.sort((a, b) => {
      const timeA = a.datePlayed ? (typeof a.datePlayed === 'string' ? Date.parse(a.datePlayed) : (a.datePlayed.toMillis ? a.datePlayed.toMillis() : 0)) : 0;
      const timeB = b.datePlayed ? (typeof b.datePlayed === 'string' ? Date.parse(b.datePlayed) : (b.datePlayed.toMillis ? b.datePlayed.toMillis() : 0)) : 0;
      return timeB - timeA; // Descending (newest first)
    });
  } catch (err) {
    console.error('fetchUserGames error:', err);
    return [];
  }
}

/** Fetch a single game for a specific user by gameId */
export async function fetchUserGameById(uid: string, gameId: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, 'User', uid, 'games', gameId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('fetchUserGameById error:', err);
    return null;
  }
}

/** Fetch ALL users (used by admin panel) */
export async function fetchAllUsers(): Promise<FirestoreUser[]> {
  try {
    const snap = await getDocs(collection(db, 'User'));
    return snap.docs.map(d => normalizeFirestoreUser(d.id, d.data()));
  } catch (err) {
    console.error('fetchAllUsers error:', err);
    return [];
  }
}

/** Fetch only students (role === 'student') */
export async function fetchStudents(): Promise<FirestoreUser[]> {
  try {
    const q = query(collection(db, 'User'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    const students = snap.docs.map(d => normalizeFirestoreUser(d.id, d.data()));
    
    // Fallback for legacy users without role field:
    if (students.length === 0) {
      console.warn('fetchStudents: No students found with role=="student", fetching all and filtering.');
      const all = await fetchAllUsers();
      return all.filter(u => !u.role || u.role === 'student');
    }
    
    return students;
  } catch (err) {
    console.error('fetchStudents error:', err);
    return [];
  }
}

/** Fetch users by district */
export async function fetchUsersByDistrict(district: string): Promise<FirestoreUser[]> {
  try {
    const q = query(
      collection(db, 'User'),
      where('SchoolDistrict', '==', district)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map(d => normalizeFirestoreUser(d.id, d.data()));
    return users.filter(u => u.role === 'student');
  } catch (err) {
    console.error('fetchUsersByDistrict error:', err);
    return [];
  }
}

// ── ADMIN COLLECTION ──────────────────────────────────────────────────────────

export interface AdminRecord {
  uid: string;
  email: string;
  role?: 'admin' | 'manager';
  isAdmin?: boolean;
  name?: string;
  district?: string;
}

/** Check if UID exists in the 'admin' collection and return record */
export async function fetchAdminRecord(uid: string): Promise<AdminRecord | null> {
  try {
    const snap = await getDoc(doc(db, 'admin', uid));
    if (snap.exists()) {
      return { uid, ...snap.data() } as AdminRecord;
    }
    return null;
  } catch (err) {
    console.error('fetchAdminRecord error:', err);
    return null;
  }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

/** Update any fields on a user document */
export async function updateUser(uid: string, fields: Partial<FirestoreUser>): Promise<void> {
  await updateDoc(doc(db, 'User', uid), fields as any);
}

/** Set user online/offline status */
export async function setUserStatus(uid: string, online: boolean): Promise<void> {
  await updateDoc(doc(db, 'User', uid), { Status: online });
}

/** Save a game for a specific user */
export async function saveUserGame(uid: string, gameData: any): Promise<string> {
  try {
    const gameId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const gameRef = doc(db, 'User', uid, 'games', gameId);
    await setDoc(gameRef, {
      ...gameData,
      id: gameId,
      datePlayed: serverTimestamp()
    });
    return gameId;
  } catch (err) {
    console.error('saveUserGame error:', err);
    throw err;
  }
}

// ── STATS HELPERS ─────────────────────────────────────────────────────────────

/** Aggregate stats from a list of students (for admin dashboard) */
export function aggregateStats(students: FirestoreUser[]) {
  const total = students.length;
  
  // A student is active if their last_activity is within the last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const active = students.filter(s => {
    if (s.last_activity) {
      const activityTime = typeof s.last_activity === 'string' ? Date.parse(s.last_activity) : (s.last_activity?.toMillis ? s.last_activity.toMillis() : s.last_activity);
      if (activityTime > thirtyDaysAgo) return true;
    }
    return s.Status === true; // Fallback to Status
  }).length;
  
  const avgRating = total > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.rating ?? 1000), 0) / total)
    : 0;
  const totalGames = students.reduce((sum, s) => sum + (s.games_played ?? 0), 0);

  // Group by district
  const byDistrict: Record<string, number> = {};
  students.forEach(s => {
    const d = s.SchoolDistrict || 'Unknown';
    byDistrict[d] = (byDistrict[d] || 0) + 1;
  });

  // Group by school
  const bySchool: Record<string, { count: number; totalElo: number }> = {};
  students.forEach(s => {
    const school = s.SchoolName || 'Unknown';
    if (!bySchool[school]) bySchool[school] = { count: 0, totalElo: 0 };
    bySchool[school].count += 1;
    bySchool[school].totalElo += s.rating ?? 1000;
  });

  return { total, active, avgRating, totalGames, byDistrict, bySchool };
}

// ── USER CREATION (ADMIN/MANAGER ONLY) ────────────────────────────────────────

/** 
 * Create a single student account.
 * Uses a secondary Firebase App instance so the Admin's session isn't logged out.
 */
export async function createStudentAccount(studentData: Partial<FirestoreUser>, password?: string): Promise<string> {
  const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp_" + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const defaultPassword = password || `Student@${new Date().getFullYear()}`;
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, studentData.Email!, defaultPassword);
    const uid = userCredential.user.uid;

    const newUserData = {
      ...studentData,
      role: 'student',
      Status: true,
      rating: 1000,
      createdAt: serverTimestamp(),
      quizCompleted: false
    };

    await setDoc(doc(db, 'User', uid), newUserData);
    return uid;
  } catch (err) {
    console.error('createStudentAccount error:', err);
    throw err;
  } finally {
    // Note: in a long-lived app, we might want to delete the secondary app to prevent memory leaks, 
    // but the Firebase Modular SDK currently manages instances gracefully or can throw if deleted early.
  }
}

/** 
 * Create multiple student accounts in bulk.
 */
export async function saveBulkStudents(students: { data: Partial<FirestoreUser>, password: string }[]): Promise<any[]> {
  const secondaryApp = initializeApp(firebaseConfig, "SecondaryBulkApp_" + Date.now());
  const secondaryAuth = getAuth(secondaryApp);
  const createdUsers = [];
  let lastError: any = null;

  for (const student of students) {
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, student.data.Email!, student.password);
      const uid = userCredential.user.uid;

      const newUserData = {
        ...student.data,
        role: 'student',
        Status: true,
        rating: 1000,
        createdAt: serverTimestamp(),
        quizCompleted: false
      };

      await setDoc(doc(db, 'User', uid), newUserData);
      
      createdUsers.push({
        ...newUserData,
        uid,
        password: student.password // returned so we can download it in excel
      });
    } catch (err: any) {
      console.error(`Error creating bulk student ${student.data.Email}:`, err);
      lastError = err;
    }
  }

  if (createdUsers.length === 0 && lastError) {
    throw lastError;
  }

  return createdUsers;
}
