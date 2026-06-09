// SIGARAM64 — Student Manager (Live Firestore Data)
import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Crown } from "../../ui";
import {
  fetchStudents,
  updateUser,
  type FirestoreUser,
} from "../../../firebase/firestoreService";
import AddStudentModal from "./AddStudentModal";

export default function StudentManager() {
  const [students, setStudents]       = useState<FirestoreUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { district } = useOutletContext<{ district: string }>();
  const [search, setSearch]           = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [editModal, setEditModal]     = useState<FirestoreUser | null>(null);
  const [editName, setEditName]       = useState("");
  const [editSchool, setEditSchool]   = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const loadStudents = () => {
    setLoadingData(true);
    fetchStudents().then(data => {
      setStudents(data);
      setLoadingData(false);
    });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = students.filter(s => {
    // 1. Global District Filter
    if (district !== "All Districts" && s.SchoolDistrict !== district) return false;

    // 2. Search Filter
    const q = search.toLowerCase();
    const matchSearch =
      (s.Name ?? "").toLowerCase().includes(q) ||
      (s.Email ?? "").toLowerCase().includes(q) ||
      (s.SchoolName ?? "").toLowerCase().includes(q) ||
      (s.SchoolDistrict ?? "").toLowerCase().includes(q) ||
      s.uid.toLowerCase().includes(q);
      
    // 3. Status Filter
    const matchFilter =
      filterActive === "all" ||
      (filterActive === "active" ? s.Status === true : s.Status !== true);
      
    return matchSearch && matchFilter;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterActive, district]);

  // Sliced data for current page
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Selection ─────────────────────────────────────────────────────────────
  function toggleSelect(uid: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.uid)));
  }

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Edit save ────────────────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!editModal) return;
    setSaving(true);
    try {
      const updates: Partial<FirestoreUser> = {
        Name: editName,
        UserName: editName,
        SchoolName: editSchool,
        SchoolDistrict: editDistrict,
      };
      await updateUser(editModal.uid, updates);
      setStudents(prev =>
        prev.map(s =>
          s.uid === editModal.uid ? { ...s, ...updates } : s
        )
      );
      setEditModal(null);
      showToast("✅ Student updated successfully");
    } catch {
      showToast("❌ Failed to update student");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active status ──────────────────────────────────────────────────
  async function toggleStatus(student: FirestoreUser) {
    const newStatus = !student.Status;
    try {
      await updateUser(student.uid, { Status: newStatus });
      setStudents(prev =>
        prev.map(s => s.uid === student.uid ? { ...s, Status: newStatus } : s)
      );
      showToast(`${newStatus ? "✅ Activated" : "⏸ Deactivated"}: ${student.Name}`);
    } catch {
      showToast("❌ Failed to update status");
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalActive   = filtered.filter(s => s.Status === true).length;
  const totalInactive = filtered.filter(s => s.Status !== true).length;
  const avgElo = filtered.length > 0
    ? Math.round(filtered.reduce((a, s) => a + (s.rating ?? 1000), 0) / filtered.length)
    : 0;

  return (
    <div className="min-h-screen bg-dark-bg font-sans">

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-navy border border-gold/40 rounded-xl px-4 py-3 text-sm text-white shadow-xl animate-fadeIn">
          {toast}
        </div>
      )}

      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Manager</h1>
            <p className="text-gray-400 text-sm">
              {loadingData ? "Loading…" : `${filtered.length} students found`}
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-gold text-xs px-4 py-2 font-semibold">+ Add Student</button>
        </div>

        {/* Stats row */}
        {loadingData ? (
          <div className="flex gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="card px-5 py-3 w-32 h-14 animate-pulse">
                <div className="h-3 bg-navy-mid rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 mb-6 flex-wrap">
            {[
              { label: "Total Students", v: filtered.length,  color: "text-gold" },
              { label: "Active",         v: totalActive,       color: "text-green-400" },
              { label: "Inactive",       v: totalInactive,     color: "text-red-400" },
              { label: "Avg Elo",        v: avgElo,            color: "text-white" },
            ].map((s, i) => (
              <div key={i} className="card px-5 py-3 flex items-center gap-3">
                <span className={`text-xl font-bold ${s.color}`}>{s.v}</span>
                <span className="text-gray-400 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, school, district…"
            className="input-field flex-1 min-w-[200px]"
          />
          <div className="flex bg-navy-mid rounded-xl p-1 gap-1">
            {(["all", "active", "inactive"] as const).map(f => (
              <button key={f}
                onClick={() => setFilterActive(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors
                  ${filterActive === f ? "bg-gold text-navy" : "text-gray-400 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="bg-navy-mid rounded-xl px-4 py-3 mb-4 flex items-center gap-4 flex-wrap">
            <span className="text-gold text-sm font-semibold">{selected.size} selected</span>
            <button className="btn-gold text-xs px-4 py-2">📧 Send Credentials</button>
            <button
              onClick={async () => {
                for (const uid of selected) {
                  await updateUser(uid, { Status: false });
                }
                setStudents(prev =>
                  prev.map(s => selected.has(s.uid) ? { ...s, Status: false } : s)
                );
                setSelected(new Set());
                showToast(`⏸ ${selected.size} students deactivated`);
              }}
              className="text-xs text-red-400 hover:text-red-300 ml-auto"
            >
              Deactivate Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-divider">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="accent-gold"
                  />
                </th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3">Student</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 hidden lg:table-cell">School</th>
                <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 hidden lg:table-cell">District</th>
                <th className="text-center text-gray-400 text-xs font-semibold px-4 py-3">Games</th>
                <th className="text-right text-gray-400 text-xs font-semibold px-4 py-3">Elo</th>
                <th className="text-center text-gray-400 text-xs font-semibold px-4 py-3">Status</th>
                <th className="text-right text-gray-400 text-xs font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                // Loading skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-divider animate-pulse">
                    <td className="px-4 py-3"><div className="w-4 h-4 bg-navy-mid rounded" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-navy-mid rounded w-32" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-navy-mid rounded w-40" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-navy-mid rounded w-28" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 bg-navy-mid rounded w-20" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-navy-mid rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-navy-mid rounded w-12 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-navy-mid rounded w-14 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-navy-mid rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                    {students.length === 0
                      ? "No students found in Firestore. Make sure Firebase is connected."
                      : "No students match your search."}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, i) => (
                  <tr key={s.uid} className="border-b border-divider hover:bg-navy-mid transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.uid)}
                        onChange={() => toggleSelect(s.uid)}
                        className="accent-gold"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                          <span className="text-navy text-xs font-bold">
                            {(s.Name || s.Email || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white text-sm font-medium">{s.Name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell truncate max-w-[180px]">
                      {s.Email}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell truncate max-w-[150px]">
                      {s.SchoolName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {s.SchoolDistrict || "—"}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold text-xs text-center">
                      {s.games_played || 0}
                    </td>
                    <td className="px-4 py-3 text-gold font-semibold text-sm text-right">
                      {s.rating ?? 1000}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(s)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                          s.Status === true
                            ? "text-green-400 bg-green-900/30 hover:bg-green-900/50"
                            : "text-red-400 bg-red-900/30 hover:bg-red-900/50"
                        }`}
                      >
                        {s.Status === true ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditModal(s);
                          setEditName(s.Name ?? "");
                          setEditSchool(s.SchoolName ?? "");
                          setEditDistrict(s.SchoolDistrict ?? "");
                        }}
                        className="text-gold text-xs hover:underline"
                      >
                        Edit
                      </button>
                      <Link
                        to={`/students/${s.uid}`}
                        className="text-white bg-navy border border-gold/30 px-2 py-1 rounded text-xs hover:bg-gold hover:text-navy transition-colors inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Result count */}
        {!loadingData && students.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            <p className="text-gray-500 text-xs text-center md:text-left">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} students
              {filtered.length !== students.length && ` (filtered from ${students.length})`}
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-navy-mid text-gold text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold hover:text-navy transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-xs px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded bg-navy-mid text-gold text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold hover:text-navy transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => setEditModal(null)}
        >
          <div
            className="bg-dark-bg border border-gold/30 rounded-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-1">Edit Student</h3>
            <p className="text-gray-500 text-xs mb-4">{editModal.Email}</p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Full Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input-field"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">School Name</label>
                <input
                  value={editSchool}
                  onChange={e => setEditSchool(e.target.value)}
                  className="input-field"
                  placeholder="School Name"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">District</label>
                <input
                  value={editDistrict}
                  onChange={e => setEditDistrict(e.target.value)}
                  className="input-field"
                  placeholder="District"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className={`flex-1 btn-gold py-3 ${saving ? "opacity-70 cursor-wait" : ""}`}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 btn-ghost py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadStudents();
            showToast("Successfully added student(s)");
          }}
        />
      )}
    </div>
  );
}
