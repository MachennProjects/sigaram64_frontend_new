// Screen 09 — District Activity Management (GPS proof, attendance, coach remarks)
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchStudents } from "../../../firebase/firestoreService";
import { Crown, Badge } from "../../ui";

// GPS_PROOFS can remain static for now until backend is ready

const GPS_PROOFS = [
  { id:1, label:"Bootcamp Start", time:"09:04 AM", gps:"11.0168° N, 76.9558° E", status:"uploaded" },
  { id:2, label:"Mid-Session",    time:"11:30 AM", gps:"11.0168° N, 76.9558° E", status:"uploaded" },
  { id:3, label:"Session End",    time:"01:00 PM", gps:"–",                        status:"pending" },
];

export default function DistrictActivity() {
  const { district } = useOutletContext<{ district: string }>();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents().then(data => {
      const filtered = district === "All Districts"
        ? data
        : data.filter(s => s.SchoolDistrict === district);
      setStudents(filtered.map(s => ({
        name: s.Name || s.Email || "?",
        id: s.uid.slice(0, 5).toUpperCase(),
        present: true,
        rating: s.rating ?? 1000,
        remark: ""
      })));
      setLoading(false);
    });
  }, [district]);
  const [tab, setTab] = useState<"attendance"|"gps"|"achievements"|"remarks">("attendance");
  const [achievement, setAchievement] = useState({ student:"", type:"", desc:"" });
  const [sessionNote, setSessionNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggleAttendance(idx: number) {
    setStudents(s => s.map((st,i) => i===idx ? {...st, present:!st.present} : st));
  }

  function updateRemark(idx: number, remark: string) {
    setStudents(s => s.map((st,i) => i===idx ? {...st, remark} : st));
  }

  const presentCount = students.filter(s => s.present).length;

  return (
    <div className="min-h-screen bg-dark-bg font-sans">
      <div className="px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Bootcamp Activity</h1>
            <p className="text-gray-400 text-sm">{district} · {new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="btn-gold text-xs px-4 py-2 font-semibold"
          >
            Submit ✓
          </button>
        </div>

        {submitted && (
          <div className="bg-green-900/40 border border-green-700/40 rounded-xl px-5 py-3 mb-5 flex items-center gap-2 animate-fadeIn">
            <span className="text-green-400">✓</span>
            <span className="text-green-400 text-sm font-semibold">Session submitted successfully. Report auto-generated.</span>
          </div>
        )}
        {/* Session summary chips */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="bg-navy-mid rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-green-400 font-bold text-lg">{presentCount}</span>
            <span className="text-gray-400 text-xs">Present</span>
          </div>
          <div className="bg-navy-mid rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-red-400 font-bold text-lg">{students.length - presentCount}</span>
            <span className="text-gray-400 text-xs">Absent</span>
          </div>
          <div className="bg-navy-mid rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-gold font-bold text-lg">{students.length}</span>
            <span className="text-gray-400 text-xs">Total</span>
          </div>
          <div className="bg-navy-mid rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-yellow-400 text-sm">📍</span>
            <span className="text-gray-400 text-xs">GPS {GPS_PROOFS.filter(g=>g.status==="uploaded").length}/{GPS_PROOFS.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-mid rounded-xl p-1 mb-5 overflow-x-auto">
          {(["attendance","gps","achievements","remarks"] as const).map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors capitalize
                ${tab===t ? "bg-gold text-navy" : "text-gray-400 hover:text-white"}`}
            >
              {t === "attendance" ? "Attendance" : t === "gps" ? "GPS Proof" : t === "achievements" ? "Achievements" : "Coach Remarks"}
            </button>
          ))}
        </div>

        {/* Attendance tab */}
        {tab === "attendance" && (
          <div className="space-y-2">
            {students.map((s,i) => (
              <div key={i} className="card px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-mid flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">{s.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{s.name}</div>
                  <div className="text-gray-500 text-xs">{s.id} · Elo {s.rating}</div>
                </div>
                <button
                  onClick={() => toggleAttendance(i)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${s.present ? "bg-green-500" : "bg-navy-mid border border-divider"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${s.present ? "right-0.5" : "left-0.5"}`} />
                </button>
                <span className={`text-xs font-semibold w-14 text-right ${s.present ? "text-green-400" : "text-red-400"}`}>
                  {s.present ? "Present" : "Absent"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* GPS Proof tab */}
        {tab === "gps" && (
          <div className="space-y-4">
            {GPS_PROOFS.map(g => (
              <div key={g.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{g.label}</h4>
                    <p className="text-gray-400 text-xs">{g.time} · {g.gps}</p>
                  </div>
                  <Badge variant={g.status==="uploaded"?"green":"gray"}>
                    {g.status==="uploaded" ? "✓ Uploaded" : "Pending"}
                  </Badge>
                </div>
                {g.status === "pending" ? (
                  <div className="border-2 border-dashed border-divider rounded-xl p-6 text-center">
                    <span className="text-3xl block mb-2">📸</span>
                    <p className="text-gray-400 text-sm mb-3">Upload GPS-tagged photo or video</p>
                    <button className="btn-outline-gold text-sm px-5 py-2">Choose File</button>
                  </div>
                ) : (
                  <div className="bg-navy-mid rounded-xl h-24 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">📷 Photo uploaded ✓</span>
                  </div>
                )}
              </div>
            ))}

            <button className="w-full border-2 border-dashed border-divider rounded-2xl p-4 text-gray-400 text-sm hover:border-gold/40 transition-colors">
              + Add Another Proof
            </button>
          </div>
        )}

        {/* Achievements tab */}
        {tab === "achievements" && (
          <div>
            <div className="card p-5 mb-4">
              <h4 className="text-white font-semibold mb-4">Log Achievement</h4>
              <div className="space-y-3">
                <select
                  value={achievement.student}
                  onChange={e => setAchievement(a=>({...a,student:e.target.value}))}
                  className="input-field"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
                <select
                  value={achievement.type}
                  onChange={e => setAchievement(a=>({...a,type:e.target.value}))}
                  className="input-field"
                >
                  <option value="">Achievement Type</option>
                  {["Tournament Win","Rating Milestone","Perfect Puzzle Set","Attendance Award","Coach Recommendation"].map(t => <option key={t}>{t}</option>)}
                </select>
                <textarea
                  value={achievement.desc}
                  onChange={e => setAchievement(a=>({...a,desc:e.target.value}))}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Describe the achievement…"
                />
                <button className="btn-gold w-full py-3">Save Achievement</button>
              </div>
            </div>

            {/* Recent achievements */}
            <div className="space-y-2">
              {[
                { student:"Arjun K.",  type:"Rating Milestone", desc:"Crossed Elo 1,200 for first time" },
                { student:"Meena L.",  type:"Tournament Win",   desc:"1st place — school tournament April 2026" },
              ].map((a,i) => (
                <div key={i} className="card px-4 py-3 flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="text-white text-sm font-semibold">{a.student}</div>
                    <div className="text-gold text-xs font-medium">{a.type}</div>
                    <div className="text-gray-400 text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remarks tab */}
        {tab === "remarks" && (
          <div className="space-y-4">
            <div className="card p-4">
              <h4 className="text-white font-semibold mb-3">Session Overall Note</h4>
              <textarea
                value={sessionNote}
                onChange={e => setSessionNote(e.target.value)}
                className="input-field resize-none w-full"
                rows={4}
                placeholder="Overall session observations, challenges, highlights…"
              />
            </div>
            <h4 className="text-white font-semibold">Per-Student Remarks</h4>
            {students.map((s,i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-navy-mid flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">{s.name[0]}</span>
                  </div>
                  <span className="text-white text-sm font-semibold">{s.name}</span>
                </div>
                <input
                  value={s.remark}
                  onChange={e => updateRemark(i, e.target.value)}
                  className="input-field text-sm"
                  placeholder="Coach remark (optional)…"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
