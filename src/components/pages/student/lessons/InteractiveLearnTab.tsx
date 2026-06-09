import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { LEARN_DATA, LearnCategory, LearnStage, LevelConfig } from "../../../../data/lessons/learnLevels";
import { Badge } from "../../../ui";

export default function InteractiveLearnTab({ onIsDeepView }: { onIsDeepView?: (isDeep: boolean) => void }) {
  const [activeCategory, setActiveCategory] = useState<LearnCategory | null>(null);
  const [activeStage, setActiveStage] = useState<LearnStage | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  useEffect(() => {
    onIsDeepView?.(activeCategory !== null);
  }, [activeCategory, onIsDeepView]);

  // Puzzle State
  const [game, setGame] = useState(new Chess());
  const [boardPosition, setBoardPosition] = useState("start");
  const [starsToCapture, setStarsToCapture] = useState<string[]>([]);
  const [movesTaken, setMovesTaken] = useState(0);
  const [status, setStatus] = useState<"ready" | "failed" | "completed">("ready");
  const [starsEarned, setStarsEarned] = useState(0);

  // Load progress from sessionStorage
  const getProgress = (stageName: string, levelNum: number) => {
    const saved = sessionStorage.getItem(`learn_progress_${stageName}_${levelNum}`);
    return saved ? parseInt(saved) : 0;
  };

  const saveProgress = (stageName: string, levelNum: number, stars: number) => {
    const current = getProgress(stageName, levelNum);
    if (stars > current) {
      sessionStorage.setItem(`learn_progress_${stageName}_${levelNum}`, stars.toString());
    }
  };

  const getStageStars = (stage: LearnStage) => {
    return stage.levels.reduce((acc, lvl) => acc + getProgress(stage.name, lvl.level), 0);
  };

  // Start Level
  const startLevel = (levelNum: number) => {
    if (!activeStage) return;
    const config = activeStage.levels.find(l => l.level === levelNum);
    if (!config) return;

    setActiveLevel(levelNum);
    setStatus("ready");
    setMovesTaken(0);
    setStarsEarned(0);

    const newGame = new Chess(config.fen);
    setGame(newGame);
    setBoardPosition(config.fen);
    setStarsToCapture(config.stars || []);
  };

  // Handle Piece Drop
  const onDrop = ({ sourceSquare, targetSquare }: any) => {
    if (!targetSquare || status === "completed" || status === "failed") return false;
    
    const config = activeStage?.levels.find(l => l.level === activeLevel);
    if (!config) return false;

    const piece = game.get(sourceSquare as any);
    if (!piece) return false;

    // Only allow white pieces
    if (piece.color === 'b') {
      alert("You cannot move black pieces!");
      return false;
    }

    // 1. Exact Answer Match (for check/stalemate/castling puzzles)
    if (config.answerMove && sourceSquare === config.answerMove.from && targetSquare === config.answerMove.to) {
      executeManualMove(sourceSquare, targetSquare);
      completeLevel(movesTaken + 1, config.optimalMoves);
      return true;
    } else if (config.answerMove) {
      // Failed exact answer
      setStatus("failed");
      return false;
    }

    // 2. Star Capture Logic (for piece movement puzzles)
    if (starsToCapture.length > 0) {
      // Basic validation: is it a legal move shape?
      // Since chess.js doesn't allow moving to empty squares if it's a capture,
      // we bypass chess.js strict validation and just use manual put/remove
      // In a real robust implementation, we'd check the move shape.
      // For this port, we will allow the drop and check if a star was captured.
      
      executeManualMove(sourceSquare, targetSquare);
      
      if (starsToCapture.includes(targetSquare)) {
        const remaining = starsToCapture.filter(s => s !== targetSquare);
        setStarsToCapture(remaining);
        
        if (remaining.length === 0) {
          completeLevel(movesTaken + 1, config.optimalMoves);
        }
      }
      return true;
    }

    // 3. Normal chess move fallback
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      
      if (move) {
        setBoardPosition(game.fen());
        setMovesTaken(prev => prev + 1);
        return true;
      }
    } catch (e) {
      return false;
    }
    
    return false;
  };

  const executeManualMove = (source: string, target: string) => {
    const newGame = new Chess(game.fen());
    const movingPiece = newGame.get(source as any);
    if (!movingPiece) return;
    newGame.remove(source as any);
    newGame.put({ type: movingPiece.type, color: movingPiece.color }, target as any);
    setGame(newGame);
    setBoardPosition(newGame.fen());
    setMovesTaken(prev => prev + 1);
  };

  const completeLevel = (moves: number, optimal: number) => {
    const stars = moves <= optimal ? 3 : moves <= optimal + 2 ? 2 : 1;
    setStarsEarned(stars);
    setStatus("completed");
    if (activeStage && activeLevel) {
      saveProgress(activeStage.name, activeLevel, stars);
    }
  };

  // Custom square styles for stars
  const customSquareStyles = () => {
    const styles: Record<string, any> = {};
    starsToCapture.forEach(star => {
      styles[star] = {
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'><path fill=\'%23C9A84C\' d=\'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\'/></svg>")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    });
    return styles;
  };

  const renderStars = (earned: number, max = 3) => {
    return Array.from({ length: max }).map((_, i) => (
      <span key={i} className={`text-xl ${i < earned ? "text-gold" : "text-gray-600"}`}>★</span>
    ));
  };

  // ── VIEWS ──

  // 1. Puzzle View
  if (activeLevel && activeStage) {
    const config = activeStage.levels.find(l => l.level === activeLevel);
    return (
      <div className="flex flex-col lg:flex-row lg:items-start gap-8 animate-fadeIn">
        <div className="flex-1 w-full max-w-lg order-2 lg:order-1">
          <button
            onClick={() => setActiveLevel(null)}
            className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm font-semibold"
          >
            ← Back to Levels
          </button>
          
          <div className="bg-navy-mid border border-divider rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">
              Level {activeLevel}
            </h2>
            <p className="text-gray-300 mb-6 min-h-[48px]">
              {config?.description || activeStage.description}
            </p>

            <div className="flex items-center justify-between mb-4 bg-navy p-3 rounded-xl border border-divider">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Moves</p>
                <p className="text-white font-mono text-lg">{movesTaken} / {config?.optimalMoves}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Target</p>
                <div className="flex">{renderStars(3)}</div>
              </div>
            </div>

            {status === "completed" && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 mb-4 text-center animate-slideUp">
                <h3 className="text-green-400 font-bold mb-2">Level Complete!</h3>
                <div className="flex justify-center gap-1 mb-4">
                  {renderStars(starsEarned)}
                </div>
                {activeLevel < 6 ? (
                  <button onClick={() => startLevel(activeLevel + 1)} className="btn-gold w-full py-2">
                    Next Level →
                  </button>
                ) : (
                  <button onClick={() => setActiveLevel(null)} className="btn-outline-gold w-full py-2">
                    Back to Stage
                  </button>
                )}
              </div>
            )}

            {status === "failed" && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-4 text-center animate-slideUp">
                <h3 className="text-red-400 font-bold mb-4">Incorrect Move</h3>
                <button onClick={() => startLevel(activeLevel)} className="btn-danger w-full py-2">
                  Retry Level ↺
                </button>
              </div>
            )}

            {status === "ready" && (
              <button onClick={() => startLevel(activeLevel)} className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm">
                Restart Level ↺
              </button>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[500px] max-w-[500px] mx-auto order-1 lg:order-2 aspect-square">
          <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-navy-mid w-full h-full">
            <Chessboard 
              options={{
                position: boardPosition,
                onPieceDrop: onDrop,
                squareStyles: customSquareStyles(),
                darkSquareStyle: { backgroundColor: '#4A6082' },
                lightSquareStyle: { backgroundColor: '#CBA98F' }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Stage Selection View
  if (activeCategory) {
    return (
      <div className="animate-fadeIn">
        <button
          onClick={() => setActiveCategory(null)}
          className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 text-sm font-semibold"
        >
          ← Back to Categories
        </button>

        <h2 className="text-white font-bold text-2xl mb-2">{activeCategory.name}</h2>
        <p className="text-gray-400 mb-8">Select a stage to begin your training.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCategory.stages.map((stage) => {
            const stars = getStageStars(stage);
            const maxStars = stage.levels.length * 3;
            
            return (
              <div key={stage.name} className="bg-navy border border-divider rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-2">{stage.name}</h3>
                <p className="text-gray-400 text-sm mb-6 h-10">{stage.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gold font-bold text-sm">★ {stars} / {maxStars}</span>
                  <div className="h-1.5 flex-1 mx-3 bg-navy-mid rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${(stars / maxStars) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {stage.levels.map((level) => {
                    const levelStars = getProgress(stage.name, level.level);
                    return (
                      <button
                        key={level.level}
                        onClick={() => {
                          setActiveStage(stage);
                          startLevel(level.level);
                        }}
                        className={`py-2 rounded-lg border text-sm font-bold transition-all ${
                          levelStars > 0 
                            ? "bg-green-900/20 border-green-700/50 text-green-400 hover:bg-green-900/40" 
                            : "bg-navy-mid border-divider text-white hover:border-gold hover:text-gold"
                        }`}
                      >
                        {level.level}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Category Selection View
  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-white font-bold text-xl mb-1">Interactive Learning</h2>
        <p className="text-gray-400 text-sm">Master chess fundamentals through interactive puzzles and challenges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {LEARN_DATA.map((category) => {
          const totalLevels = category.stages.reduce((acc, stage) => acc + stage.levels.length, 0);
          const totalMaxStars = totalLevels * 3;
          const totalEarnedStars = category.stages.reduce((acc, stage) => acc + getStageStars(stage), 0);
          const progressPercent = Math.round((totalEarnedStars / totalMaxStars) * 100) || 0;

          return (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category)}
              className="flex flex-col text-left bg-navy hover:bg-navy-mid border border-divider hover:border-gold shadow-lg hover:shadow-gold/10 rounded-2xl overflow-hidden transition-all group"
            >
              {/* Thumbnail Placeholder */}
              <div className="h-40 bg-gradient-to-br from-navy to-black relative flex items-center justify-center border-b border-divider group-hover:border-gold/30 w-full overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {category.name === "Chess Pieces" ? "♟" :
                   category.name === "Fundamentals" ? "♜" :
                   category.name === "Intermediate" ? "♝" : "♛"}
                </span>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                {/* Image tag ready for user to add src later */}
                {/* <img src="..." alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-80" /> */}
              </div>

              <div className="p-5 flex flex-col flex-1 w-full">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>
                  <div className="shrink-0 whitespace-nowrap">
                    <Badge variant="gold">{totalLevels} Levels</Badge>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-black rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-gold-light to-gold rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-gold font-bold text-xs w-8 text-right">{progressPercent}%</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
