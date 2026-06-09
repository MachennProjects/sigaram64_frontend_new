import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { useAuth } from '../../../context/AuthContext';
import { Crown, Badge } from '../../ui';
import ChessBoard from '../../chess/ChessBoard';

// Question data imports
import basicQuestions from '../../../data/quiz/basicQuestions';
import intermediateExercises from '../../../data/quiz/intermediateExercises';
import advancedExercises from '../../../data/quiz/advancedExercises';

import { updateUser } from '../../../firebase/firestoreService';

interface ParsedMove {
  from: string;
  to: string;
  san: string;
  promotion?: string;
}

interface QuizResultPayload {
  userId: string;
  quizCompleted: boolean;
  quizScore: number;
  playerCategory: string;
  aiLevel: number;
  estimatedElo: number;
  breakdown: { basic: string; intermediate: string; advanced: string };
  completedAt: string;
}

// Helper to convert SAN moves string to coordinate moves list using a dummy chess game
function parseCorrectMoves(startingFen: string, correctMovesStr: string): ParsedMove[] {
  const tempGame = new Chess();
  try {
    tempGame.load(startingFen);
  } catch (e) {
    tempGame.reset();
  }

  const moves = correctMovesStr.split(/\s+/);
  const parsed: ParsedMove[] = [];

  for (const moveStr of moves) {
    if (!moveStr) continue;
    try {
      const move = tempGame.move(moveStr);
      parsed.push({
        from: move.from,
        to: move.to,
        san: move.san,
        promotion: move.promotion,
      });
    } catch (e) {
      console.error("Failed to parse move:", moveStr, "on FEN:", tempGame.fen(), e);
      break;
    }
  }
  return parsed;
}

export default function ChessAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Phase: 'initial-dialog' | 'quiz' | 'submitting' | 'results'
  const [phase, setPhase] = useState<'initial-dialog' | 'quiz' | 'submitting' | 'results'>('initial-dialog');

  const [language, setLanguage] = useState<'english' | 'tamil'>(() => {
    const saved = sessionStorage.getItem('sigaram64_quiz_lang');
    return (saved === 'english' || saved === 'tamil') ? saved : 'english';
  });

  // Toggle lang callback from primary top bar
  useEffect(() => {
    const handleToggle = () => {
      setLanguage(l => l === 'english' ? 'tamil' : 'english');
    };
    window.addEventListener('toggle-quiz-lang', handleToggle);
    return () => {
      window.removeEventListener('toggle-quiz-lang', handleToggle);
    };
  }, []);

  // Broadcast and persist lang changes
  useEffect(() => {
    sessionStorage.setItem('sigaram64_quiz_lang', language);
    window.dispatchEvent(new CustomEvent('quiz-lang-changed', { detail: language }));
  }, [language]);

  // Section: 'basic' | 'intermediate' | 'advanced'
  const [currentSection, setCurrentSection] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Question selection indexes (stored to maintain constant questions on language toggle)
  const [quizData, setQuizData] = useState<{
    basicIndices: number[];
    intermediateIndices: number[];
    advancedIndices: number[];
  } | null>(null);

  // Answers state
  const [answers, setAnswers] = useState<{
    basic: (string | null)[];
    intermediate: string[];
    advanced: string[];
  }>({
    basic: Array(15).fill(null),
    intermediate: Array(20).fill(""),
    advanced: Array(15).fill(""),
  });

  // Warning text
  const [warningMessage, setWarningMessage] = useState<string>('');

  // Active puzzle board play state
  const [boardPosition, setBoardPosition] = useState<string>('start');

  // Hint State: 0 = none, 1 = text hint, 2 = show expected notation
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  // Results calculation state
  const [results, setResults] = useState<QuizResultPayload | null>(null);

  // Animated Elo and Score counter
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [animatedElo, setAnimatedElo] = useState<number>(800);

  // 1. Shuffling and picking questions on mount
  useEffect(() => {
    const getShuffledIndices = (max: number, count: number): number[] => {
      const indices = Array.from({ length: max }, (_, i) => i);
      return indices.sort(() => 0.5 - Math.random()).slice(0, count);
    };

    setQuizData({
      basicIndices: getShuffledIndices(30, 15),
      intermediateIndices: getShuffledIndices(28, 20),
      advancedIndices: getShuffledIndices(18, 15),
    });
  }, []);

  // 2. Load puzzle board whenever active puzzle changes
  const activePuzzle = useMemo(() => {
    if (!quizData) return null;
    if (currentSection === 'intermediate') {
      return intermediateExercises[quizData.intermediateIndices[currentIndex]];
    } else if (currentSection === 'advanced') {
      return advancedExercises[quizData.advancedIndices[currentIndex]];
    }
    return null;
  }, [quizData, currentSection, currentIndex]);

  useEffect(() => {
    if (activePuzzle) {
      setBoardPosition(activePuzzle.FEN);
      setHintLevel(0);
    }
  }, [activePuzzle, currentSection, currentIndex]);

  // Answer status checks
  const totalAnsweredCount = useMemo(() => {
    const basicCount = answers.basic.filter(a => a !== null).length;
    const interCount = answers.intermediate.filter(a => a.trim() !== "").length;
    const advCount = answers.advanced.filter(a => a.trim() !== "").length;
    return basicCount + interCount + advCount;
  }, [answers]);

  const basicCompleted = useMemo(() => {
    return !answers.basic.includes(null);
  }, [answers.basic]);

  // Handle Hints
  const handleGetHint = () => {
    if (!activePuzzle) return;
    if (hintLevel === 0) {
      setHintLevel(1);
      setHintsUsedCount(prev => prev + 1);
    } else if (hintLevel === 1) {
      setHintLevel(2);
    }
  };

  // Navigations between questions and sections
  const handlePrev = () => {
    setWarningMessage('');
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Go to previous section
      if (currentSection === 'intermediate') {
        setCurrentSection('basic');
        setCurrentIndex(14);
      } else if (currentSection === 'advanced') {
        setCurrentSection('intermediate');
        setCurrentIndex(19);
      }
    }
  };

  const handleNext = () => {
    setWarningMessage('');
    if (currentSection === 'basic') {
      if (currentIndex < 14) {
        setCurrentIndex(prev => prev + 1);
      } else {
        if (!basicCompleted) {
          setWarningMessage(language === 'english' ? "Please answer all Basic MCQ questions before proceeding." : "தொடர்வதற்கு முன் அனைத்து அடிப்படை கேள்விகளுக்கும் பதிலளிக்கவும்.");
          return;
        }
        setCurrentSection('intermediate');
        setCurrentIndex(0);
      }
    } else if (currentSection === 'intermediate') {
      if (currentIndex < 19) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentSection('advanced');
        setCurrentIndex(0);
      }
    } else if (currentSection === 'advanced') {
      if (currentIndex < 14) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleSubmitQuiz();
      }
    }
  };

  // Early submit handler (available in the header or footer once answered count >= 30)
  const handleSubmitQuiz = async () => {
    if (totalAnsweredCount < 30) {
      setWarningMessage(language === 'english' ? "Please answer at least 30 questions overall before submitting." : "சமர்ப்பிப்பதற்கு முன் குறைந்தது 30 கேள்விகளுக்குப் பதிலளிக்கவும்.");
      return;
    }

    setPhase('submitting');

    // Compute Score
    let basicCorrectCount = 0;
    answers.basic.forEach((ans, i) => {
      if (!quizData) return;
      const bIdx = quizData.basicIndices[i];
      const correct = basicQuestions.english.questions[bIdx].correctAnswer;
      if (ans === correct) {
        basicCorrectCount++;
      }
    });

    let intermediateCorrectCount = 0;
    answers.intermediate.forEach((ans, i) => {
      if (!quizData) return;
      const qIdx = quizData.intermediateIndices[i];
      const correct = intermediateExercises[qIdx].correctMoves;
      if (ans.trim().replace(/\s+/g, ' ') === correct.trim().replace(/\s+/g, ' ')) {
        intermediateCorrectCount++;
      }
    });

    let advancedCorrectCount = 0;
    answers.advanced.forEach((ans, i) => {
      if (!quizData) return;
      const qIdx = quizData.advancedIndices[i];
      const correct = advancedExercises[qIdx].correctMoves;
      if (ans.trim().replace(/\s+/g, ' ') === correct.trim().replace(/\s+/g, ' ')) {
        advancedCorrectCount++;
      }
    });

    const totalScore = (basicCorrectCount * 1) + (intermediateCorrectCount * 2) + (advancedCorrectCount * 3);

    // Determine player category and AI level
    let category = '';
    let level = 3;
    if (totalScore >= 0 && totalScore <= 20) {
      category = 'Basic Level Player';
      level = 3;
    } else if (totalScore >= 21 && totalScore <= 35) {
      category = 'Intermediate Level Player';
      level = 5;
    } else {
      category = 'Advanced Level Player';
      level = 7;
    }

    const estElo = 800 + totalScore * 16; // 800 to 2400 linear mapping

    const payload = {
      userId: user?.id || 'GUEST',
      quizCompleted: true,
      quizScore: totalScore,
      playerCategory: category,
      aiLevel: level,
      estimatedElo: estElo,
      breakdown: {
        basic: `${basicCorrectCount}/15`,
        intermediate: `${intermediateCorrectCount}/20`,
        advanced: `${advancedCorrectCount}/15`
      },
      completedAt: new Date().toISOString()
    };

    setResults(payload);

    // Save to Firebase backend
    try {
      if (user?.id && user.id !== 'GUEST') {
        await updateUser(user.id, {
          quizCompleted: true,
          quizScore: totalScore,
          playerCategory: category,
          aiLevel: level,
          rating: estElo,
        });
      }
      
      // Save local sessionStorage cache
      sessionStorage.setItem(`sigaram64_quiz_${user?.id || 'GUEST'}`, JSON.stringify(payload));
    } catch (e) {
      console.error("Error saving assessment results", e);
    }

    // Move to Results phase
    setPhase('results');
  };

  // Easing animated Elo/Score counters
  useEffect(() => {
    if (phase === 'results' && results) {
      // Score Count Animation
      let startScore = 0;
      const endScore = results.quizScore;
      const durationScore = 1500;
      const stepTimeScore = Math.max(Math.floor(durationScore / (endScore || 1)), 25);

      const timerScore = setInterval(() => {
        startScore += 1;
        if (startScore >= endScore) {
          setAnimatedScore(endScore);
          clearInterval(timerScore);
        } else {
          setAnimatedScore(startScore);
        }
      }, stepTimeScore);

      // Elo Count Animation
      let startElo = 800;
      const endElo = results.estimatedElo;
      const durationElo = 1500;
      const deltaElo = endElo - 800;
      const stepTimeElo = 20;
      const totalSteps = durationElo / stepTimeElo;
      let stepCount = 0;

      const timerElo = setInterval(() => {
        stepCount++;
        const progress = stepCount / totalSteps;
        // Ease out quadratic
        const currentElo = Math.floor(800 + deltaElo * (1 - (1 - progress) * (1 - progress)));
        if (stepCount >= totalSteps) {
          setAnimatedElo(endElo);
          clearInterval(timerElo);
        } else {
          setAnimatedElo(currentElo);
        }
      }, stepTimeElo);

      return () => {
        clearInterval(timerScore);
        clearInterval(timerElo);
      };
    }
  }, [phase, results]);

  // Navigation redirect if "No" in welcome dialog
  const handleInitialResponse = (knowsChess: boolean) => {
    if (knowsChess) {
      setPhase('quiz');
    } else {
      navigate('/lessons');
    }
  };

  // 4. Layouts
  if (!quizData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-gold animate-pulse text-lg font-semibold uppercase tracking-wider">Loading Question Bank...</div>
      </div>
    );
  }

  const globalIndex = currentSection === 'basic' ? currentIndex : currentSection === 'intermediate' ? 15 + currentIndex : 35 + currentIndex;
  const progressPercent = ((globalIndex) / 50) * 100;

  return (
    <div className="w-full flex-1 flex flex-col font-sans select-none overflow-y-auto">

      {/* ── Phase 1: Identity / Welcome Dialog ── */}
      {phase === 'initial-dialog' && (
        <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-8 animate-fadeIn">
          <div className="w-full max-w-[480px] card-glass p-6 md:p-8 relative overflow-hidden border-gold/20 shadow-2xl text-center">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="text-5xl animate-bounce mb-4">👑</div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide font-heading">
              {language === 'english' ? "Welcome, Champion!" : "வாழ்க, சாம்பியன்!"}
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              {language === 'english'
                ? "Let's discover your chess level with this smart assessment system."
                : "இந்த அறிவார்ந்த மதிப்பீட்டு முறை மூலம் உங்கள் சதுரங்க நிலையை கண்டறியலாம்."}
            </p>

            <div className="bg-navy/60 rounded-xl px-5 py-4 mb-6 border border-divider/40 text-left">
              <h2 className="text-gold-light text-sm font-semibold mb-2 uppercase tracking-wide">
                {language === 'english' ? "Assessment Info" : "மதிப்பீட்டு தகவல்"}
              </h2>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex gap-2"><span>✓</span><span>{language === 'english' ? "50 questions: 15 basic, 20 intermediate, 15 advanced" : "50 கேள்விகள்: 15 அடிப்படை, 20 இடைநிலை, 15 மேம்பட்ட"}</span></li>
                <li className="flex gap-2"><span>✓</span><span>{language === 'english' ? "Solve puzzles by dragging chess pieces on the board" : "பலகையில் துண்டுகளை நகர்த்தி புதிர்களை தீர்க்கவும்"}</span></li>
                <li className="flex gap-2"><span>✓</span><span>{language === 'english' ? "Answer at least 30 questions to submit" : "சமர்ப்பிக்க குறைந்தது 30 கேள்விகளுக்கு பதிலளிக்கவும்"}</span></li>
              </ul>
            </div>

            <p className="text-white font-bold text-lg mb-6 leading-tight">
              {language === 'english' ? "Do you know how to play chess?" : "உங்களுக்கு சதுரங்கம் விளையாட தெரியுமா?"}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => handleInitialResponse(true)}
                className="flex-1 btn-gold py-2.5 px-3 text-xs md:text-sm font-bold shadow-lg whitespace-nowrap"
              >
                {language === 'english' ? "Yes, let's start" : "ஆம், ஆரம்பிக்கலாம்"}
              </button>
              <button
                onClick={() => handleInitialResponse(false)}
                className="flex-1 btn-ghost py-2.5 px-3 text-xs md:text-sm font-bold text-gray-300 border border-divider hover:text-white whitespace-nowrap"
              >
                {language === 'english' ? "No, I want to learn" : "இல்லை, நான் கற்க வேண்டும்"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 2: Active Quiz Flow ── */}
      {phase === 'quiz' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl md:max-w-6xl mx-auto px-4 py-4 md:py-6 animate-slideUp overflow-hidden">
          {currentSection === 'basic' ? (
            /* ── Basic MCQ: Single Unified Card ── */
            <div className="w-full max-w-2xl md:max-w-3xl card relative border-divider shadow-2xl p-5 md:p-8 flex flex-col gap-5 md:gap-6 justify-between md:min-h-[480px]">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-2xl" />

              {/* Progress & Badge */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-gray-400 font-medium">
                    {language === 'english' ? `Question ${globalIndex + 1} of 50` : `கேள்வி ${globalIndex + 1} இல் 50`}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{totalAnsweredCount} answered</span>
                    {totalAnsweredCount >= 30 && (
                      <button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        {language === 'english' ? "Submit Quiz" : "சமர்ப்பிக்கவும்"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="flex justify-between items-center mt-2.5">
                  <Badge variant="gold">
                    {language === 'english' ? "Basic MCQ" : "அடிப்படை கொள்கை"}
                  </Badge>
                  <span className="text-gray-500 text-[11px]">1pt each</span>
                </div>
              </div>

              {/* Question Text */}
              {(() => {
                const basicIndexInPool = quizData.basicIndices[currentIndex];
                const q = basicQuestions[language].questions[basicIndexInPool];
                return (
                  <div className="flex-1 flex flex-col gap-4 justify-center">
                    <h2 className="text-white text-base md:text-lg lg:text-xl font-bold leading-snug">
                      Q{currentIndex + 1}. {q.question}
                    </h2>
                    <div className="space-y-3">
                      {q.options.map((option, idx) => {
                        const optionLetter = String.fromCharCode(65 + idx);
                        const isSelected = answers.basic[currentIndex] === optionLetter;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setAnswers(prev => {
                                const copy = [...prev.basic];
                                copy[currentIndex] = optionLetter;
                                return { ...prev, basic: copy };
                              });
                            }}
                            className={`w-full flex items-center gap-4 text-left border rounded-xl px-4 py-2.5 md:py-3.5 text-xs md:text-sm font-semibold transition-all cursor-pointer hover:border-gold/50 hover:bg-navy-mid/85 hover:scale-[1.01] ${isSelected
                                ? 'bg-gold/15 border-gold text-gold-light shadow-md scale-[1.005]'
                                : 'bg-navy-mid border-divider text-gray-200 hover:bg-navy-mid/60'
                              }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isSelected ? 'bg-gold text-navy' : 'bg-navy text-gold-light border border-gold/20'
                              }`}>
                              {optionLetter}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Warning Message */}
              {warningMessage && (
                <div className="bg-red-950/50 border border-red-700/40 text-red-400 text-[11px] px-3 py-2 rounded-lg text-center font-medium animate-fadeIn">
                  ⚠️ {warningMessage}
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-divider/60 pt-4 mt-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="btn-ghost py-2 px-4 text-xs flex items-center gap-1 hover:bg-navy disabled:opacity-20 disabled:pointer-events-none"
                >
                  ← {language === 'english' ? "Previous" : "முந்தைய"}
                </button>
                <div className="text-gray-400 text-xs font-semibold">{currentIndex + 1} / 15</div>
                <button
                  onClick={handleNext}
                  className="btn-gold py-2 px-4 text-xs flex items-center gap-1 shadow-md"
                >
                  {language === 'english' ? "Next →" : "அடுத்த →"}
                </button>
              </div>
            </div>
          ) : (
            /* ── Interactive Puzzles: Split Column Layout ── */
            <div className="w-full flex flex-col md:grid md:grid-cols-5 gap-6 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible items-stretch">
              
              {/* Left Column: Board Card */}
              <div className="md:col-span-3 flex flex-col items-center justify-center bg-card-bg border border-divider rounded-2xl p-4 md:p-6 shadow-xl relative min-h-0 md:min-h-[460px] lg:min-h-[480px]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-2xl" />

                {/* Progress bar inside left card */}
                <div className="w-full mb-3">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-gray-400 font-medium">
                      {language === 'english' ? `Question ${globalIndex + 1} of 50` : `கேள்வி ${globalIndex + 1} இல் 50`}
                    </span>
                    <span className="text-gray-500">{totalAnsweredCount} answered</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* Chess Board wrapper */}
                <div className="w-full max-w-[320px] md:max-w-[380px] lg:max-w-[400px] flex-1 flex items-center justify-center py-2 md:py-4">
                  <ChessBoard
                    position={boardPosition}
                    onMove={() => false}
                    orientation="white"
                    disabled={true}
                  />
                </div>
              </div>

              {/* Right Column: Info & Hints & Navigation Card */}
              <div className="md:col-span-2 flex flex-col justify-between bg-card-bg border border-divider rounded-2xl p-4 md:p-6 shadow-xl relative min-h-0 md:min-h-[460px] lg:min-h-[480px]">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-2xl" />

                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex justify-between items-center">
                    <Badge variant={currentSection === 'intermediate' ? 'coming' : 'green'}>
                      {currentSection === 'intermediate'
                        ? (language === 'english' ? "Intermediate Puzzle" : "இடைநிலை புதிர்")
                        : (language === 'english' ? "Advanced Puzzle" : "மேம்பட்ட புதிர்")}
                    </Badge>
                    <span className="text-gray-500 text-xs">
                      {currentSection === 'intermediate' ? "2pts each" : "3pts each"}
                    </span>
                  </div>

                  {/* Puzzle Objectives / FEN */}
                  <div className="bg-navy/40 border border-divider/40 rounded-xl p-3 flex flex-col gap-2">
                    <h3 className="text-white text-xs font-bold flex items-center gap-1.5">
                      <span>♟</span>
                      <span>{language === 'english' ? "Puzzle Objectives" : "புதிர் குறிக்கோள்கள்"}</span>
                    </h3>
                    <p className="text-xs md:text-sm text-white font-medium leading-relaxed">
                      {activePuzzle?.description}
                    </p>
                  </div>

                  {/* Text Input for Move Sequence */}
                  <div className="flex flex-col gap-2 my-1">
                    <label className="text-xs font-bold text-gold-light">
                      {language === 'english' ? "Enter Move Sequence:" : "நகர்வு வரிசையை உள்ளிடவும்:"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'english' ? "e.g., Rf8+ Bxf8 d6+ Be6..." : "எ.கா., Rf8+ Bxf8 d6+ Be6..."}
                      value={answers[currentSection === 'intermediate' ? 'intermediate' : 'advanced'][currentIndex]}
                      onChange={(e) => {
                        setAnswers(prev => {
                          const section = currentSection === 'intermediate' ? 'intermediate' : 'advanced';
                          const copy = [...prev[section]];
                          copy[currentIndex] = e.target.value;
                          return { ...prev, [section]: copy };
                        });
                      }}
                      className="w-full bg-navy/60 border border-divider/60 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>

                  {/* Hints and Instructions */}
                  <div className="flex flex-col gap-3">
                    <div className="hidden md:block bg-navy-mid/45 border border-divider/55 rounded-xl p-3 text-[11px] text-gray-300 leading-normal">
                      <span className="font-bold text-gold-light block mb-1">
                        {language === 'english' ? "Instructions:" : "வழிமுறைகள்:"}
                      </span>
                      {language === 'english'
                        ? "Enter the complete move sequence in standard algebraic notation (e.g. Rf8+ Bxf8 d6+ Be6 Bxe6#)."
                        : "சதுரங்க குறிப்பு முறையில் நகர்வு வரிசையை உள்ளிடவும் (எ.கா. Rf8+ Bxf8 d6+ Be6 Bxe6#)."}
                    </div>

                    <div className="bg-navy/35 border border-divider/30 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-[11px] text-gold-light block">
                            {language === 'english' ? "Progressive Hint" : "குறிப்பு அமைப்பு"}
                          </span>
                        </div>
                        <button
                          onClick={handleGetHint}
                          disabled={hintLevel >= 2}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer ${hintLevel >= 2
                              ? 'bg-navy text-gray-500 border border-divider'
                              : 'bg-gold text-navy hover:bg-gold-light'
                            }`}
                        >
                          {hintLevel === 0 ? (language === 'english' ? "Get Hint" : "குறிப்பு பெறு") :
                            hintLevel === 1 ? (language === 'english' ? "Show Move" : "நகர்வு காட்டு") :
                              (language === 'english' ? "Showing Move" : "நகர்வு காட்டப்பட்டது")}
                        </button>
                      </div>

                      {hintLevel >= 1 && activePuzzle && (
                        <div className="mt-2.5 bg-navy-mid/50 border border-divider/50 rounded-lg p-2.5 text-[11px] text-gold-light animate-fadeIn">
                          <span className="font-bold block mb-0.5">Hint:</span>
                          {activePuzzle.hint}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning message inside right column */}
                {warningMessage && (
                  <div className="bg-red-950/50 border border-red-700/40 text-red-400 text-[10px] px-3 py-1.5 rounded-lg text-center font-medium my-2 animate-fadeIn">
                    ⚠️ {warningMessage}
                  </div>
                )}

                {/* Footer Navigation controls */}
                <div className="flex items-center justify-between border-t border-divider/60 pt-4 mt-3">
                  <button
                    onClick={handlePrev}
                    className="btn-ghost py-2 px-3 text-xs flex items-center gap-1 hover:bg-navy"
                  >
                    ← {language === 'english' ? "Previous" : "முந்தைய"}
                  </button>

                  <div className="text-gray-400 text-xs font-semibold">
                    {currentSection === 'intermediate' ? `${currentIndex + 1} / 20` : `${currentIndex + 1} / 15`}
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn-gold py-2 px-3 text-xs flex items-center gap-1 shadow-md"
                  >
                    {currentSection === 'advanced' && currentIndex === 14 ? (
                      language === 'english' ? "Submit" : "சமர்ப்பிக்க"
                    ) : (
                      language === 'english' ? "Next →" : "அடுத்த →"
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Phase 3: Submitting State ── */}
      {phase === 'submitting' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn px-5 text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === 'english' ? "Analyzing Chess Intelligence..." : "சதுரங்க திறனை ஆய்வு செய்கிறது..."}
          </h2>
          <p className="text-gray-400 text-sm">
            {language === 'english'
              ? "Assessing ratings, checking category bounds, and storing data..."
              : "மதிப்பீடுகளைக் கணக்கிட்டு, கோப்புகளைச் சேமிக்கிறது..."}
          </p>
        </div>
      )}

      {/* ── Phase 4: Results Display ── */}
      {phase === 'results' && results && (
        <div className="flex-1 flex items-center justify-center px-4 py-8 animate-fadeIn relative overflow-hidden">

          {/* Confetti canvas animation simulator (CSS-based particles in bg) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {Array.from({ length: 40 }).map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 4;
              const scale = 0.5 + Math.random() * 0.8;
              const rotation = Math.random() * 360;
              const color = i % 3 === 0 ? 'bg-gold' : i % 3 === 1 ? 'bg-green-400' : 'bg-blue-400';
              return (
                <div
                  key={i}
                  className={`absolute w-3 h-3 ${color} rounded-sm`}
                  style={{
                    left: `${left}%`,
                    top: `-20px`,
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    animation: `confettiFall 4s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          <div className="w-full max-w-lg card-glow p-8 relative border-gold shadow-2xl text-center animate-scaleIn bg-card-bg/95">
            <div className="gold-top-accent" />

            <div className="text-6xl mb-3">🏆</div>
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-wide font-heading">
              {language === 'english' ? "Assessment Complete!" : "மதிப்பீடு முடிந்தது!"}
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              {language === 'english' ? "Congratulations on completing your chess evaluation!" : "மதிப்பீட்டை வெற்றிகரமாக முடித்ததற்கு வாழ்த்துகள்!"}
            </p>

            {/* Score & ELO Card */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-navy p-5 rounded-2xl border border-divider text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gold/40" />
                <div className="text-gold text-4xl font-black">{animatedScore}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-1">
                  {language === 'english' ? "Total Score" : "மொத்த மதிப்பெண்"}
                </div>
              </div>

              <div className="bg-navy p-5 rounded-2xl border border-divider text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/40" />
                <div className="text-green-400 text-4xl font-black">{animatedElo}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-1">
                  {language === 'english' ? "Estimated ELO" : "மதிப்பீட்டு ELO"}
                </div>
              </div>
            </div>

            {/* Badge Category display */}
            <div className="card p-6 border-divider mb-6 bg-navy/60">
              <h2 className="text-gold-light font-bold text-lg leading-tight mb-2">
                {results.playerCategory}
              </h2>
              <div className="mt-2">
                <Badge variant={results.quizScore >= 36 ? 'gold' : results.quizScore >= 21 ? 'green' : 'gray'}>
                  {results.quizScore >= 36 ? "Gold Category" : results.quizScore >= 21 ? "Silver Category" : "Bronze Category"}
                </Badge>
              </div>

              {/* Section Breakdown */}
              <div className="mt-5 space-y-2.5 text-xs text-left max-w-xs mx-auto">
                <div className="flex items-center justify-between text-gray-300">
                  <span>♟ {language === 'english' ? "Basic MCQ:" : "அடிப்படை கொள்கை:"}</span>
                  <span className="font-bold font-mono">{results.breakdown.basic}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>🧩 {language === 'english' ? "Intermediate Puzzles:" : "இடைநிலை புதிர்கள்:"}</span>
                  <span className="font-bold font-mono">{results.breakdown.intermediate}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>⚔️ {language === 'english' ? "Advanced Puzzles:" : "மேம்பட்ட புதிர்கள்:"}</span>
                  <span className="font-bold font-mono">{results.breakdown.advanced}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-gold py-4 text-base font-extrabold shadow-lg animate-pulse"
            >
              {language === 'english' ? "Go to Dashboard →" : "டாஷ்போர்டுக்கு செல்லவும் →"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
