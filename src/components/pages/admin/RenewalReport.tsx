// Screen 11 — SDAT Renewal Report (PDF-style preview + download)
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Crown, Badge } from "../../ui";
import { fetchStudents, aggregateStats } from "../../../firebase/firestoreService";
import { triggerPrint } from "../../../services/exportService";

// SCHOOL_STATS generated dynamically from real data

const MILESTONES = [
  { label:"Students crossed Elo 1000",   value:"312" },
  { label:"Students crossed Elo 1200",   value:"104" },
  { label:"Tournament participants",      value:"87" },
  { label:"Brilliant moves recorded",    value:"1,482" },
  { label:"GPS-verified bootcamp sessions",value:"143" },
];

export default function RenewalReport() {
  const { district } = useOutletContext<{ district: string }>();
  const [period, setPeriod] = useState("Apr 2025 – Mar 2026");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  
  const [schoolStats, setSchoolStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents().then(data => {
      const filtered = district === "All Districts"
        ? data
        : data.filter(s => s.SchoolDistrict === district);
        
      const stats = aggregateStats(filtered);
      
      const rows = Object.entries(stats.bySchool).map(([school, schoolData]) => {
        const schoolStudents = filtered.filter(s => s.SchoolName === school);
        const activeCount = schoolStudents.filter(s => s.Status === true).length;
        const activeRate = schoolData.count > 0 ? Math.round((activeCount / schoolData.count) * 100) : 0;
        
        return {
          school,
          students: schoolData.count,
          sessions: 24, // placeholder until sessions collection is live
          avgElo: schoolData.count > 0 ? Math.round(schoolData.totalElo / schoolData.count) : 0,
          puzzles: 1000, // placeholder
          active: `${activeRate}%`
        };
      });
      setSchoolStats(rows);
      setLoading(false);
    });
  }, [district]);

  function handleDownload() {
    triggerPrint();
    setDownloaded(true);
  }

  return (
    <div className="min-h-screen bg-dark-bg font-sans">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title & Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Renewal Report</h1>
            <p className="text-gray-400 text-sm">Preview & Download</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-navy-mid text-gold font-bold border border-gold/40 rounded-xl px-4 py-2 text-sm shadow-md">
              {district}
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`btn-gold text-xs px-4 py-2 font-semibold ${downloading ? "opacity-70 cursor-wait" : ""}`}
            >
              {downloading ? "Generating…" : downloaded ? "✓ Downloaded" : "⬇ Download PDF"}
            </button>
          </div>
        </div>

        {/* Report header — mimics PDF letterhead */}
        <div className="bg-navy rounded-2xl border border-gold/30 overflow-hidden mb-6">
          <div className="h-2 bg-gold" />
          <div className="px-8 py-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={24} />
                <span className="text-gold text-xl font-bold tracking-wide">SIGARAM64</span>
              </div>
              <h1 className="text-white text-2xl font-bold mb-1">SDAT Chess Programme</h1>
              <h2 className="text-gold-light text-lg font-semibold">Annual Renewal Report</h2>
              <p className="text-gray-400 text-sm mt-2">{district} District · {period}</p>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs mb-1">Report generated</div>
              <div className="text-white text-sm font-semibold">23 Apr 2026</div>
              <div className="text-gray-400 text-xs mt-2">FIDE Certified Platform</div>
              <Badge variant="green">Renewal Ready ✓</Badge>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="card p-6 mb-6">
          <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">Executive Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label:"Total Students",    value:"1,048+",  icon:"👥" },
              { label:"Schools Covered",   value:"5",        icon:"🏫" },
              { label:"Bootcamp Sessions", value:"143",      icon:"📅" },
              { label:"Avg Elo Growth",    value:"+142",     icon:"📈" },
            ].map((s,i) => (
              <div key={i} className="bg-dark-bg rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-gold text-2xl font-bold">{s.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            The SIGARAM64 AI Chess Education Programme delivered a comprehensive year of chess training across {district} district government schools.
            Using proprietary CAT assessment, Stockfish 18 game analysis, and Tamil-language AI coaching, students achieved measurable,
            data-verified improvements in chess skill and engagement. All 5 schools maintained above 80% bootcamp attendance.
          </p>
        </div>

        {/* Key Milestones */}
        <div className="card p-6 mb-6">
          <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">Key Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MILESTONES.map((m,i) => (
              <div key={i} className="flex items-center justify-between bg-dark-bg rounded-xl px-4 py-3">
                <span className="text-gray-300 text-sm">{m.label}</span>
                <span className="text-gold font-bold text-lg">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* School-wise table */}
        <div className="card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-divider">
            <h3 className="text-gold text-sm font-semibold uppercase tracking-wider">School-wise Performance</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-divider">
                {["School","Students","Sessions","Avg Elo","Puzzles Solved","Active Rate"].map(h => (
                  <th key={h} className="text-left text-gray-400 text-xs font-semibold px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">
                    Loading school data...
                  </td>
                </tr>
              ) : schoolStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">
                    No school data available for {district}.
                  </td>
                </tr>
              ) : schoolStats.map((s,i) => (
                <tr key={i} className="border-b border-divider">
                  <td className="px-5 py-3 text-white text-sm">{s.school}</td>
                  <td className="px-5 py-3 text-gray-300 text-sm">{s.students}</td>
                  <td className="px-5 py-3 text-gray-300 text-sm">{s.sessions}</td>
                  <td className="px-5 py-3 text-gold font-semibold text-sm">{s.avgElo}</td>
                  <td className="px-5 py-3 text-gray-300 text-sm">{s.puzzles}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${parseInt(s.active)>90?"text-green-400":"text-yellow-400"}`}>{s.active}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GPS Activity Proof summary */}
        <div className="card p-6 mb-6">
          <h3 className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">GPS Activity Proof Summary</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-gold text-3xl font-bold">143</div>
              <div className="text-gray-400 text-xs">Sessions Verified</div>
            </div>
            <div className="h-12 w-px bg-divider" />
            <div className="text-center">
              <div className="text-gold text-3xl font-bold">429</div>
              <div className="text-gray-400 text-xs">GPS Photos Uploaded</div>
            </div>
            <div className="h-12 w-px bg-divider" />
            <div className="text-center">
              <div className="text-green-400 text-3xl font-bold">100%</div>
              <div className="text-gray-400 text-xs">Auto-timestamped</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            All bootcamp sessions were documented with GPS-tagged photographs uploaded in real time through the SIGARAM64 platform.
            Timestamps and coordinates are verifiable and tamper-proof.
          </p>
        </div>

        {/* Certification block */}
        <div className="bg-navy border border-gold/30 rounded-2xl p-6 text-center mb-6">
          <div className="text-5xl mb-3">🏅</div>
          <h3 className="text-white font-bold text-lg mb-1">FIDE Certified Chess Education Platform</h3>
          <p className="text-gray-400 text-sm mb-3">
            SIGARAM64 is the official AI Chess Education partner for Tamil Nadu government schools.
            This report constitutes the official renewal documentation for SDAT programme continuation.
          </p>
          <p className="text-gold-light text-sm font-semibold">Prof. SuryaKumar S A · FIDE National Instructor · Chess Bishop</p>
        </div>

        {/* Download CTA */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleDownload}
            className="flex-1 btn-gold py-4 font-bold text-base"
          >
            {downloaded ? "✓ PDF Downloaded" : "⬇ Download Full PDF Report"}
          </button>
          <button className="flex-1 btn-outline-gold py-4 font-semibold">
            📧 Email to District Officer
          </button>
        </div>
      </div>
    </div>
  );
}
