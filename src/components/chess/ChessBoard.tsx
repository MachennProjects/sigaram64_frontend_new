import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';

/* ── Props ─────────────────────────────────────────────────────────── */
interface ChessBoardProps {
  position: string;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  orientation?: 'white' | 'black';
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  kingInCheck?: string | null;
  hintSquares?: { from: string; to: string } | null;
}

/* ── Unicode piece map ─────────────────────────────────────────────── */
const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

/* ── Promotion pieces ──────────────────────────────────────────────── */
const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];

/* ── Helpers ───────────────────────────────────────────────────────── */
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function squareColor(file: number, rank: number): 'light' | 'dark' {
  return (file + rank) % 2 === 0 ? 'light' : 'dark';
}

/* ── Component ─────────────────────────────────────────────────────── */
const ChessBoard: React.FC<ChessBoardProps> = ({
  position,
  onMove,
  orientation = 'white',
  disabled = false,
  lastMove = null,
  kingInCheck = null,
  hintSquares = null,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [promotionInfo, setPromotionInfo] = useState<{
    from: string;
    to: string;
    color: Color;
  } | null>(null);

  /* Parse position with chess.js */
  const game = useMemo(() => {
    const g = new Chess();
    try {
      g.load(position);
    } catch {
      g.reset();
    }
    return g;
  }, [position]);

  /* Board data: 8x8 grid */
  const board = useMemo(() => game.board(), [game]);

  /* Clear selection when position changes */
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [position]);

  /* Determine ordered files/ranks based on orientation */
  const orderedFiles = orientation === 'white' ? FILES : [...FILES].reverse();
  const orderedRanks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  /* Build a set of squares that have pieces for capture-ring display */
  const occupiedSquares = useMemo(() => {
    const set = new Set<string>();
    board.forEach((row) =>
      row.forEach((sq) => {
        if (sq) set.add(sq.square);
      })
    );
    return set;
  }, [board]);

  /* ── Click handler ───────────────────────────────────────────────── */
  const handleSquareClick = useCallback(
    (square: string) => {
      if (disabled) return;
      if (promotionInfo) return; // wait for promo dialog

      /* If a piece is already selected */
      if (selectedSquare) {
        /* Clicked the same square → deselect */
        if (square === selectedSquare) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        /* Clicked a legal target */
        if (legalMoves.includes(square)) {
          /* Check if promotion */
          const piece = game.get(selectedSquare as Square);
          if (
            piece &&
            piece.type === 'p' &&
            ((piece.color === 'w' && square[1] === '8') ||
              (piece.color === 'b' && square[1] === '1'))
          ) {
            setPromotionInfo({ from: selectedSquare, to: square, color: piece.color });
            return;
          }

          const success = onMove(selectedSquare, square);
          setSelectedSquare(null);
          setLegalMoves([]);
          if (!success) {
            /* Move rejected — shake? Just deselect */
          }
          return;
        }

        /* Clicked another own piece → re-select */
        const clickedPiece = game.get(square as Square);
        if (clickedPiece && clickedPiece.color === game.turn()) {
          const moves = game.moves({ square: square as Square, verbose: true });
          setSelectedSquare(square);
          setLegalMoves(moves.map((m) => m.to));
          return;
        }

        /* Invalid target → deselect */
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      /* No selection yet — select own piece */
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        const moves = game.moves({ square: square as Square, verbose: true });
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
      }
    },
    [disabled, selectedSquare, legalMoves, game, onMove, promotionInfo]
  );

  /* ── Promotion handler ───────────────────────────────────────────── */
  const handlePromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!promotionInfo) return;
      onMove(promotionInfo.from, promotionInfo.to, piece);
      setPromotionInfo(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    },
    [promotionInfo, onMove]
  );

  const cancelPromotion = useCallback(() => {
    setPromotionInfo(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  /* Checkmate State */
  const checkmateState = useMemo(() => {
    try {
      const g = new Chess(position);
      return { isCheckmate: g.isCheckmate(), turn: g.turn() };
    } catch {
      return { isCheckmate: false, turn: 'w' };
    }
  }, [position]);

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="relative flex flex-col w-full items-center select-none">
      {/* Board container */}
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl border border-[#805e4b]/30"
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
        }}
      >
        {/* Grid */}
        <div className="grid grid-cols-8 grid-rows-[repeat(8,1fr)] w-full h-full">
          {orderedRanks.map((rank, rankIdx) =>
            orderedFiles.map((file, fileIdx) => {
              const sq = `${file}${rank}`;
              const color = squareColor(fileIdx, rankIdx);
              const isDark = color === 'dark';

              /* Piece on this square */
              const boardRow = 8 - parseInt(rank);
              const boardCol = FILES.indexOf(file);
              const pieceData = board[boardRow]?.[boardCol];

              /* State flags */
              const isSelected = selectedSquare === sq;
              const isLegal = legalMoves.includes(sq);
              const isLastMoveFrom = lastMove?.from === sq;
              const isLastMoveTo = lastMove?.to === sq;
              const isKingInCheck = kingInCheck === sq;
              const isHintFrom = hintSquares?.from === sq;
              const isHintTo = hintSquares?.to === sq;
              const isOccupied = occupiedSquares.has(sq);

              /* Square background */
              const baseBg = isDark ? '#805E4B' : '#D8B384';

              /* Calculate slide animation if this piece just arrived here */
              let slideStyle = {};
              if (isLastMoveTo && lastMove?.from && pieceData) {
                const fromFile = lastMove.from[0];
                const fromRank = lastMove.from[1];
                const fromFileIdx = orderedFiles.indexOf(fromFile);
                const fromRankIdx = orderedRanks.indexOf(fromRank);
                
                if (fromFileIdx !== -1 && fromRankIdx !== -1) {
                  const dx = (fromFileIdx - fileIdx) * 100;
                  const dy = (fromRankIdx - rankIdx) * 100;
                  slideStyle = {
                    animation: 'slideInPiece 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                    '--start-x': `${dx}%`,
                    '--start-y': `${dy}%`,
                  };
                }
              }

              return (
                <div
                  key={sq}
                  className="relative flex items-center justify-center cursor-pointer transition-colors duration-150"
                  style={{ backgroundColor: baseBg }}
                  onClick={() => handleSquareClick(sq)}
                >
                  {/* Last move highlight */}
                  {(isLastMoveFrom || isLastMoveTo) && (
                    <div className="absolute inset-0 bg-yellow-500/25 pointer-events-none" />
                  )}

                  {/* Selected square highlight */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 0 3px #C9A84C, inset 0 0 12px rgba(201,168,76,0.5)',
                        background: 'rgba(201,168,76,0.2)',
                      }}
                    />
                  )}

                  {/* King in check */}
                  {isKingInCheck && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(239,68,68,0.7) 0%, rgba(239,68,68,0.3) 60%, transparent 100%)',
                        boxShadow: 'inset 0 0 8px rgba(239,68,68,0.6)',
                      }}
                    />
                  )}

                  {/* Hint squares */}
                  {(isHintFrom || isHintTo) && (
                    <div
                      className="absolute inset-0 pointer-events-none animate-glowPulse rounded-sm"
                      style={{
                        background: 'rgba(201,168,76,0.3)',
                        boxShadow: '0 0 12px rgba(201,168,76,0.4)',
                      }}
                    />
                  )}

                  {/* Legal move dot (empty square) */}
                  {isLegal && !isOccupied && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div
                        className="rounded-full"
                        style={{
                          width: '26%',
                          height: '26%',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  )}

                  {/* Legal move ring (capturable piece) */}
                  {isLegal && isOccupied && (
                    <div
                      className="absolute inset-[3px] rounded-full pointer-events-none z-10"
                      style={{
                        border: '3px solid rgba(0,0,0,0.35)',
                      }}
                    />
                  )}

                  {/* Piece */}
                  {pieceData && (
                    <div
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                      style={slideStyle}
                    >
                      <img
                        src={`https://lichess1.org/assets/piece/cburnett/${pieceData.color}${pieceData.type.toUpperCase()}.svg`}
                        alt={`${pieceData.color}${pieceData.type}`}
                        className="w-[90%] h-[90%] object-contain select-none"
                        style={{
                          cursor: disabled ? 'default' : 'pointer',
                        }}
                      />
                    </div>
                  )}

                  {/* King Checkmate Badges */}
                  {pieceData?.type === 'k' && checkmateState.isCheckmate && (
                    pieceData.color === checkmateState.turn ? (
                      <div className="absolute -top-3 right-[-10px] z-50 bg-[#CA3431] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap border-2 border-white pointer-events-none">
                        Checkmate
                      </div>
                    ) : (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-50 bg-white text-[#96BC4B] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border-2 border-[#96BC4B] pointer-events-none">
                        Winner
                      </div>
                    )
                  )}

                  {/* Coordinate: file label (bottom row) */}
                  {rankIdx === 7 && (
                    <span
                      className="absolute bottom-[2px] right-[3px] text-[10px] font-bold pointer-events-none z-30 leading-none"
                      style={{ color: isDark ? '#D8B384' : '#805E4B' }}
                    >
                      {file}
                    </span>
                  )}

                  {/* Coordinate: rank label (left column) */}
                  {fileIdx === 0 && (
                    <span
                      className="absolute top-[2px] left-[3px] text-[10px] font-bold pointer-events-none z-30 leading-none"
                      style={{ color: isDark ? '#D8B384' : '#805E4B' }}
                    >
                      {rank}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 z-40 cursor-not-allowed" />
        )}
      </div>

      {/* ── Promotion Dialog ───────────────────────────────────────────── */}
      {promotionInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl"
            onClick={cancelPromotion}
          />

          {/* Dialog */}
          <div className="relative bg-[#10193E] border border-[#C9A84C]/60 rounded-2xl p-3 shadow-2xl animate-fadeIn z-10">
            <p className="text-center text-xs text-gray-400 mb-2 font-medium tracking-wide uppercase">
              Promote to
            </p>
            <div className="flex gap-2">
              {PROMOTION_PIECES.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePromotion(p)}
                  className="w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: '#12234A',
                    border: '1px solid #1E2E52',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84C';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(201,168,76,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1E2E52';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={`https://lichess1.org/assets/piece/cburnett/${promotionInfo.color}${p.toUpperCase()}.svg`}
                    alt={p}
                    className="w-[82%] h-[82%] object-contain select-none pointer-events-none"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
