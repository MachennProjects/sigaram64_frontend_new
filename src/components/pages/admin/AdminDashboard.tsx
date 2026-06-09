// SIGARAM64 — Admin Dashboard (Live Firestore Data)
import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Crown } from "../../ui";
import { fetchStudents, aggregateStats, type FirestoreUser } from "../../../firebase/firestoreService";
import { exportStudentsToCSV } from "../../../services/exportService";

type Tab = "overview" | "schools" | "activity";

interface SchoolRow {
  school: string;
  district: string;
  students: number;
  avgElo: number;
  active: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>("overview");
  const [students, setStudents]     = useState<FirestoreUser[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { district } = useOutletContext<{ district: string }>();

  // ── Fetch real data from Firestore ────────────────────────────────────────
  useEffect(() => {
    fetchStudents().then(data => {
      setStudents(data);
      setLoadingData(false);
    });
  }, []);

  const stats = aggregateStats(students);

  // Build district list from real data
  const districts = ["All Districts", ...Array.from(new Set(students.map(s => s.SchoolDistrict ?? "Unknown").filter(Boolean)))];

  // Filter students by selected district
  const filtered = district === "All Districts"
    ? students
    : students.filter(s => s.SchoolDistrict === district);

  const filteredStats = aggregateStats(filtered);

  // Build school rows from real data
  const schoolRows: SchoolRow[] = Object.entries(filteredStats.bySchool)
    .map(([school, data]) => ({
      school,
      district: filtered.find(s => s.SchoolName === school)?.SchoolDistrict ?? "",
      students: data.count,
      avgElo: data.count > 0 ? Math.round(data.totalElo / data.count) : 0,
      active: filtered.filter(s => s.SchoolName === school && s.Status === true).length,
    }))
    .sort((a, b) => b.avgElo - a.avgElo);

  const METRICS = [
    { label: "Total Students",    value: loadingData ? "…" : filteredStats.total.toLocaleString(), icon: "👥", color: "text-gold" },
    { label: "Active Students",   value: loadingData ? "…" : filteredStats.active.toLocaleString(), icon: "📈", color: "text-green-400" },
    { label: "Avg Rating (Elo)",  value: loadingData ? "…" : filteredStats.avgRating.toLocaleString(), icon: "♟",  color: "text-white" },
    { label: "Total Games Played",value: loadingData ? "…" : filteredStats.totalGames.toLocaleString(), icon: "🎮", color: "text-gold-light" },
  ];

  // Rating distribution buckets from real data
  const ratingBuckets = [
    { label: "<800",      count: filtered.filter(s => (s.rating ?? 0) < 800).length },
    { label: "800–1000",  count: filtered.filter(s => (s.rating ?? 0) >= 800  && (s.rating ?? 0) < 1000).length },
    { label: "1000–1200", count: filtered.filter(s => (s.rating ?? 0) >= 1000 && (s.rating ?? 0) < 1200).length },
    { label: "1200–1400", count: filtered.filter(s => (s.rating ?? 0) >= 1200 && (s.rating ?? 0) < 1400).length },
    { label: "1400–1600", count: filtered.filter(s => (s.rating ?? 0) >= 1400 && (s.rating ?? 0) < 1600).length },
    { label: ">1600",     count: filtered.filter(s => (s.rating ?? 0) >= 1600).length },
  ];
  const maxBucket = Math.max(...ratingBuckets.map(b => b.count), 1);

  return (
    <div className="min-h-screen bg-dark-bg font-sans">
      <div className="px-6 lg:px-16 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">District Dashboard</h1>
            <p className="text-gray-400 text-sm">
              {district} · {loadingData ? "Loading…" : `${filteredStats.total} students`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {localStorage.getItem('sigaram64_last_bulk') && (
              <button 
                onClick={() => {
                  try {
                    const data = JSON.parse(localStorage.getItem('sigaram64_last_bulk') || '{}');
                    if (data.users) {
                      let csv = "Name,Email,Password,School,District\n";
                      data.users.forEach((u: any) => {
                        csv += `"${u.Name}","${u.Email}","${u.password}","${u.SchoolName}","${u.SchoolDistrict}"\n`;
                      });
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Sigaram64_${data.school}_Students_Backup.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  } catch(e) {}
                }} 
                className="btn-outline-gold text-sm px-4 py-2"
                title="Re-download the last created bulk accounts"
              >
                📥 Last Bulk CSV
              </button>
            )}
            <button onClick={() => exportStudentsToCSV(filtered, `${district}_dashboard_export.csv`)} className="btn-outline-gold text-sm px-4 py-2">📤 Export</button>
            <button onClick={() => navigate('/students')} className="btn-gold text-sm px-4 py-2">Manage Students</button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loadingData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 h-24 animate-pulse">
                <div className="h-3 bg-navy-mid rounded w-1/2 mb-3" />
                <div className="h-7 bg-navy-mid rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Metric cards */}
        {!loadingData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {METRICS.map((m, i) => (
              <div key={i} className="card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gold rounded-t-2xl" />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <div className={`text-2xl lg:text-3xl font-bold mb-1 ${m.color}`}>{m.value}</div>
                <div className="text-gray-400 text-xs">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-navy-mid rounded-xl p-1 mb-6 max-w-sm">
          {(["overview", "schools", "activity"] as const).map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors capitalize
                ${tab === t ? "bg-gold text-navy" : "text-gray-400 hover:text-white"}`}
            >
              {t === "overview" ? "Overview" : t === "schools" ? "Schools" : "Activity"}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && !loadingData && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Rating distribution chart — real data */}
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Rating Distribution</h3>
                <span className="text-gray-500 text-xs">{filteredStats.total} students</span>
              </div>
              <div className="flex items-end gap-2 h-32">
                {ratingBuckets.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-gray-400 text-[10px]">{b.count}</span>
                    <div
                      className="w-full bg-gold rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max((b.count / maxBucket) * 100, b.count > 0 ? 4 : 0)}px`,
                        opacity: 0.5 + (i / ratingBuckets.length) * 0.5,
                      }}
                    />
                    <span className="text-gray-500 text-[9px] text-center">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="space-y-3">
              {[
                { label: "Quiz Completed",       value: `${filtered.filter(s => s.quizCompleted).length} / ${filteredStats.total}`, color: "text-green-400" },
                { label: "Challenge Mode Done",  value: `${filtered.filter(s => s.threegameanalysisover).length} / ${filteredStats.total}`, color: "text-gold" },
                { label: "Districts in View",    value: Object.keys(filteredStats.byDistrict).length.toString(), color: "text-white" },
                { label: "Schools Covered",      value: Object.keys(filteredStats.bySchool).length.toString(), color: "text-gold-light" },
              ].map((s, i) => (
                <div key={i} className="card p-4 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{s.label}</span>
                  <span className={`font-semibold text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schools tab */}
        {tab === "schools" && !loadingData && (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left text-gray-400 text-xs font-semibold px-5 py-3">School</th>
                  <th className="text-left text-gray-400 text-xs font-semibold px-5 py-3 hidden md:table-cell">District</th>
                  <th className="text-right text-gray-400 text-xs font-semibold px-5 py-3">Students</th>
                  <th className="text-right text-gray-400 text-xs font-semibold px-5 py-3">Avg Elo</th>
                  <th className="text-right text-gray-400 text-xs font-semibold px-5 py-3">Active</th>
                </tr>
              </thead>
              <tbody>
                {schoolRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-500 text-sm">
                      No school data found for this district.
                    </td>
                  </tr>
                ) : schoolRows.map((r, i) => (
                  <tr key={i} className="border-b border-divider hover:bg-navy-mid transition-colors">
                    <td className="px-5 py-3 text-white text-sm">{r.school}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{r.district}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm text-right">{r.students}</td>
                    <td className="px-5 py-3 text-gold font-semibold text-sm text-right">{r.avgElo}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-semibold ${r.students > 0 && r.active / r.students > 0.8 ? "text-green-400" : "text-yellow-400"}`}>
                        {r.active} / {r.students}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity tab — static (no Firestore activity log yet) */}
        {tab === "activity" && (
          <div className="card p-8 text-center">
            <p className="text-gray-400 text-sm">Activity feed will be available once the activity log collection is set up in Firestore.</p>
          </div>
        )}

        {/* Empty state */}
        {!loadingData && students.length === 0 && (
          <div className="mt-8 card p-10 text-center">
            <p className="text-gold text-2xl mb-2">📭</p>
            <p className="text-white font-semibold mb-1">No students found in Firestore</p>
            <p className="text-gray-400 text-sm">Make sure the Firebase project is connected and the <code className="text-gold">User</code> collection has data.</p>
          </div>
        )}

      </div>
    </div>
  );
}
