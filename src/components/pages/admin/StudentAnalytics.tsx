import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserById, fetchUserGames, type FirestoreUser } from '../../../firebase/firestoreService';
import { GameAnalysisResult, AnalyzedMove, MoveClass, getGameOutcome } from '../../../engine/gameAnalyzer';

/**
 * Converts a legacy game document from Firestore into the structured GameAnalysisResult
 * expected by the new GameAnalysis.tsx component.
 */
export function convertLegacyGameToAnalysis(game: any): GameAnalysisResult {
  // If this is a new format game already containing summary stats, return it directly.
  if (game && typeof game === 'object' && game.summary && game.summary.white && game.summary.black) {
    let gameDate = game.date;
    if (game.datePlayed) {
      gameDate = typeof game.datePlayed === 'string' ? game.datePlayed : new Date(game.datePlayed.toMillis ? game.datePlayed.toMillis() : game.datePlayed).toISOString();
    }
    return {
      ...game,
      date: gameDate || game.date || new Date().toISOString()
    };
  }

  const moves: AnalyzedMove[] = (game.moves || []).map((m: any, idx: number) => ({
    moveIndex: idx,
    san: m.san || '?',
    color: m.color || (idx % 2 === 0 ? 'w' : 'b'),
    fen: m.fen || '',
    fenBefore: m.fenBefore || '',
    from: m.from || '',
    to: m.to || '',
    evaluation: Math.round((m.evaluation || 0) * 100),
    evalBefore: Math.round((m.evalBefore || 0) * 100),
    bestMove: m.bestMove || '',
    bestMoveUci: m.bestMoveUci || '',
    bestMoveFrom: m.bestMoveFrom || '',
    bestMoveTo: m.bestMoveTo || '',
    classification: (m.classification || 'good') as MoveClass,
    winPercentBefore: m.winPercentBefore || 50,
    winPercentAfter: m.winPercentAfter || 50,
    cpLoss: m.cpLoss || 0,
    comment: m.comment || '',
    pieceMoved: m.pieceMoved || (m.san ? m.san.charAt(0) : '')
  }));

  const accuracy = game.summaryStats?.accuracy || 0;
  const blunders = game.summaryStats?.blunders || 0;
  const mistakes = game.summaryStats?.mistakes || 0;
  const inaccuracies = game.summaryStats?.inaccuracies || 0;

  return {
    moves,
    summary: {
      white: { accuracy, brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, inaccuracy: inaccuracies, mistake: mistakes, miss: 0, blunder: blunders, book: 0, acpl: game.summaryStats?.acpl || 0 },
      black: { accuracy, brilliant: 0, great: 0, best: 0, excellent: 0, good: 0, inaccuracy: inaccuracies, mistake: mistakes, miss: 0, blunder: blunders, book: 0, acpl: game.summaryStats?.acpl || 0 },
    },
    evalHistory: moves.map(m => m.evaluation),
    result: game.result || "Unknown",
    totalMoves: moves.length,
    date: game.datePlayed ? (typeof game.datePlayed === 'string' ? game.datePlayed : new Date(game.datePlayed?.toMillis ? game.datePlayed.toMillis() : 0).toISOString()) : new Date().toISOString(),
    coachSummary: "This is a past game played on Sigaram64.",
    playerColor: 'white', // Legacy games default to white unless stated
    difficulty: game.aiLevel ? `AI Level ${game.aiLevel}` : "Unknown"
  };
}

export default function StudentAnalytics() {
  const { uid } = useParams();
  const [student, setStudent] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    if (uid) {
      Promise.all([
        fetchUserById(uid),
        fetchUserGames(uid)
      ]).then(([userData, gamesData]) => {
        setStudent(userData);
        setGames(gamesData);
        setLoading(false);
      });
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg p-8 flex items-center justify-center">
        <div className="text-gold font-bold">Loading Analytics...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-dark-bg p-8 flex flex-col items-center justify-center">
        <div className="text-red-400 font-bold mb-4">Student not found</div>
        <Link to="/students" className="btn-outline-gold px-4 py-2 text-sm">Back to Students</Link>
      </div>
    );
  }

  const winRate = student.games_played ? Math.round(((student.games_won || 0) / student.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-dark-bg font-sans p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/students" className="w-10 h-10 rounded-full bg-navy-mid flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy transition-colors">
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {student.Name || student.Email || 'Unknown'}
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${student.Status ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                {student.Status ? 'Active' : 'Inactive'}
              </span>
            </h1>
            <p className="text-gray-400 text-sm">{student.SchoolName || 'No School'} · {student.SchoolDistrict || 'No District'}</p>
          </div>
          <div className="text-right">
            <div className="text-gold text-3xl font-black">{student.rating ?? 1000}</div>
            <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Current Elo</div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="text-gray-400 text-xs mb-1">Games Played</div>
            <div className="text-2xl font-bold text-white">{student.games_played || 0}</div>
          </div>
          <div className="card p-5">
            <div className="text-gray-400 text-xs mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">{winRate}%</div>
          </div>
          <div className="card p-5">
            <div className="text-gray-400 text-xs mb-1">AI Level Reached</div>
            <div className="text-2xl font-bold text-gold">{student.aiLevel || 1}</div>
          </div>
          <div className="card p-5">
            <div className="text-gray-400 text-xs mb-1">Last Active</div>
            <div className="text-lg font-bold text-white mt-1">
              {student.last_activity ? new Date(typeof student.last_activity === 'string' ? student.last_activity : (student.last_activity?.toMillis ? student.last_activity.toMillis() : student.last_activity)).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Game Record */}
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Game Record</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-400">Won ({student.games_won || 0})</span>
                  <span className="text-red-400">Lost ({(student.games_played || 0) - (student.games_won || 0) - (student.games_drawn || 0)})</span>
                </div>
                <div className="h-3 rounded-full bg-red-900/40 overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: `${winRate}%` }} />
                  <div className="bg-gray-500 h-full" style={{ width: `${student.games_played ? ((student.games_drawn || 0) / student.games_played) * 100 : 0}%` }} />
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">{student.games_drawn || 0} Draws</div>
              </div>
            </div>
          </div>

          {/* Module Progress */}
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-4">Module Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Initial Quiz</span>
                  <span className={student.quizCompleted ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                    {student.quizCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Challenge Mode (3 Games)</span>
                  <span className={student.threegameanalysisover ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                    {student.threegameanalysisover ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Game History List */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Game History ({games.length})</h3>
            </div>
            
            {games.length === 0 ? (
              <div className="h-32 flex items-center justify-center border-2 border-dashed border-divider rounded-xl">
                <span className="text-gray-500 text-sm">No games recorded yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-divider text-gray-400 text-xs uppercase">
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Result</th>
                      <th className="pb-3 pr-4 font-semibold text-center">Moves</th>
                      <th className="pb-3 pr-4 font-semibold text-center">Accuracy</th>
                      <th className="pb-3 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => {
                      const dateStr = game.datePlayed 
                        ? new Date(typeof game.datePlayed === 'string' ? game.datePlayed : (game.datePlayed?.toMillis ? game.datePlayed.toMillis() : 0)).toLocaleDateString() 
                        : 'Unknown Date';
                        
                      const outcome = getGameOutcome(game.result || '', game.playerColor || 'white');
                      const isWin = outcome === 'win';
                      const isLoss = outcome === 'loss';
                      
                      return (
                        <tr key={game.id} className="border-b border-divider/50 hover:bg-navy-mid/50 transition-colors">
                          <td className="py-4 pr-4 text-sm text-gray-300">{dateStr}</td>
                          <td className="py-4 pr-4 text-sm font-semibold">
                            <span className={isWin ? "text-green-400" : isLoss ? "text-red-400" : "text-gray-300"}>
                              {game.result || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-sm text-center text-gray-400">
                            {game.moves?.length ? Math.floor(game.moves.length / 2) : "—"}
                          </td>
                          <td className="py-4 pr-4 text-sm text-center font-mono">
                            {game.summaryStats?.accuracy ? (
                              <span className="text-gold">{game.summaryStats.accuracy}%</span>
                            ) : "—"}
                          </td>
                          <td className="py-4 text-right">
                            <Link 
                              to={`/students/${uid}/games/${game.id}`}
                              state={{ analysisResult: convertLegacyGameToAnalysis(game) }}
                              className="text-xs text-gold border border-gold/30 hover:bg-gold hover:text-navy px-3 py-1.5 rounded transition-colors"
                            >
                              Analyze
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
