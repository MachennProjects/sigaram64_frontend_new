export interface LevelConfig {
  level: number;
  fen: string;
  stars?: string[];
  optimalMoves: number;
  description?: string;
  answerMove?: { from: string; to: string };
  solutions?: { from: string; to: string }[][];
  mainPiece?: string;
}

export interface LearnStage {
  name: string;
  description: string;
  levels: LevelConfig[];
}

export interface LearnCategory {
  name: string;
  stages: LearnStage[];
}

export const LEARN_DATA: LearnCategory[] = [
  {
    "name": "Chess Pieces",
    "stages": [
      {
        "name": "The Rook",
        "description": "Capture the star using the rook in the least number of moves.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5"
            ],
            "optimalMoves": 2
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5"
            ],
            "optimalMoves": 3
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5",
              "d7"
            ],
            "optimalMoves": 4
          },
          {
            "level": 4,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5",
              "d7",
              "g7"
            ],
            "optimalMoves": 5
          },
          {
            "level": 5,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5",
              "d7",
              "g7",
              "a3",
              "a7"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "8/8/8/8/8/3R4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5",
              "d7",
              "g7",
              "a3",
              "a7",
              "h8"
            ],
            "optimalMoves": 8
          }
        ]
      },
      {
        "name": "The Bishop",
        "description": "Learn diagonal moves to capture pieces.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4"
            ],
            "optimalMoves": 2
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4",
              "g6"
            ],
            "optimalMoves": 3
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4",
              "f7",
              "g6"
            ],
            "optimalMoves": 4
          },
          {
            "level": 4,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4",
              "f7",
              "g6",
              "a8"
            ],
            "optimalMoves": 5
          },
          {
            "level": 5,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4",
              "f7",
              "g6",
              "a8",
              "b1",
              "a2"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "8/8/8/8/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "e4",
              "f7",
              "g6",
              "a8",
              "b1",
              "a2",
              "h7"
            ],
            "optimalMoves": 8
          }
        ]
      },
      {
        "name": "The Queen",
        "description": "Master the queens powerful moves.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5"
            ],
            "optimalMoves": 2
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "f5"
            ],
            "optimalMoves": 3
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "f5",
              "e4"
            ],
            "optimalMoves": 4
          },
          {
            "level": 4,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "f5",
              "e4",
              "g7"
            ],
            "optimalMoves": 5
          },
          {
            "level": 5,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "f5",
              "e4",
              "g7",
              "a3",
              "a7"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "8/8/8/8/8/3Q4/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "f5",
              "e4",
              "g7",
              "a3",
              "a7",
              "h8"
            ],
            "optimalMoves": 8
          }
        ]
      },
      {
        "name": "The King",
        "description": "Keep your king safe while capturing.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4"
            ],
            "optimalMoves": 1
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4",
              "e4"
            ],
            "optimalMoves": 2
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4",
              "e4",
              "e3"
            ],
            "optimalMoves": 3
          },
          {
            "level": 4,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4",
              "e4",
              "e3",
              "c3"
            ],
            "optimalMoves": 4
          },
          {
            "level": 5,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4",
              "e4",
              "e3",
              "c3",
              "c2"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "8/8/8/8/8/3K4/8/7k w - - 0 1",
            "stars": [
              "d4",
              "e4",
              "e3",
              "c3",
              "c2",
              "d2",
              "e2"
            ],
            "optimalMoves": 8
          }
        ]
      },
      {
        "name": "The Knight",
        "description": "Master the L-shaped moves of the knight.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5"
            ],
            "optimalMoves": 1
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5",
              "f5"
            ],
            "optimalMoves": 2
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5",
              "f5",
              "c6"
            ],
            "optimalMoves": 3
          },
          {
            "level": 4,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5",
              "f5",
              "c6",
              "f2"
            ],
            "optimalMoves": 4
          },
          {
            "level": 5,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5",
              "f5",
              "c6",
              "f2",
              "b3",
              "g3"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "8/8/8/8/8/3N4/8/4K2k w - - 0 1",
            "stars": [
              "e5",
              "f5",
              "c6",
              "f2",
              "b3",
              "g3",
              "a1",
              "h8"
            ],
            "optimalMoves": 8
          }
        ]
      },
      {
        "name": "The Pawn",
        "description": "Understand the fundamentals of pawn movement.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/8/8/3P4/4K2k w - - 0 1",
            "stars": [
              "d3"
            ],
            "optimalMoves": 1
          },
          {
            "level": 2,
            "fen": "8/8/8/8/8/8/3P4/4K2k w - - 0 1",
            "stars": [
              "d4"
            ],
            "optimalMoves": 2
          },
          {
            "level": 3,
            "fen": "8/8/8/8/8/8/3P4/4K2k w - - 0 1",
            "stars": [
              "d4",
              "e5"
            ],
            "optimalMoves": 3
          },
          {
            "level": 4,
            "fen": "7k/8/8/8/8/8/3P2P1/4K3 w - - 0 1",
            "stars": [
              "d4",
              "c5",
              "g4"
            ],
            "optimalMoves": 4
          },
          {
            "level": 5,
            "fen": "7k/8/8/8/8/8/3P2P1/4K3 w - - 0 1",
            "stars": [
              "d4",
              "g4",
              "f5"
            ],
            "optimalMoves": 6
          },
          {
            "level": 6,
            "fen": "7k/8/8/8/8/8/3P2P1/4K3 w - - 0 1",
            "stars": [
              "d4",
              "g4",
              "f5",
              "e5"
            ],
            "optimalMoves": 8
          }
        ]
      }
    ]
  },
  {
    "name": "Fundamentals",
    "stages": [
      {
        "name": "Board setup",
        "description": "Set up the board correctly.",
        "levels": [
          {
            "level": 1,
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1",
            "optimalMoves": 1,
            "description": "This is the initial position of every game of chess! Make any move to continue."
          },
          {
            "level": 2,
            "fen": "r6r/7k/8/8/8/8/7K/2RR4 w kq - 0 1",
            "stars": [
              "a1",
              "h1"
            ],
            "optimalMoves": 1,
            "description": "First place the rooks! They go in the corners."
          },
          {
            "level": 3,
            "fen": "rn4nr/7k/8/8/8/8/2NN3K/R6R w - - 0 1",
            "stars": [
              "b1",
              "g1"
            ],
            "optimalMoves": 1,
            "description": "Then place the knights! They go next to the rooks."
          },
          {
            "level": 4,
            "fen": "rnb2bnr/7k/8/8/4BB2/8/7K/RN4NR w KQ - 0 1",
            "stars": [
              "c1",
              "f1"
            ],
            "optimalMoves": 1,
            "description": "Place the bishops! They go next to the knights."
          },
          {
            "level": 5,
            "fen": "rnbq1bnr/7k/8/8/5Q2/8/7K/RNB2BNR w - - 0 1",
            "stars": [
              "d1"
            ],
            "optimalMoves": 1,
            "description": "Place the queen! She goes on her own color."
          },
          {
            "level": 6,
            "fen": "rnbqkbnr/8/8/8/5K2/8/8/RNBQ1BNR w KQkq - 0 1",
            "stars": [
              "e1"
            ],
            "optimalMoves": 1,
            "description": "Place the king! Right next to his queen."
          }
        ]
      },
      {
        "name": "Castling",
        "description": "Learn castling rules.",
        "levels": [
          {
            "level": 1,
            "fen": "rnbqkbnr/pppppppp/8/8/2B5/4PN2/PPPP1PPP/RNBQK2R w KQ - 0 1",
            "optimalMoves": 1,
            "description": "Move your king two squares to castle king-side!",
            "answerMove": {
              "from": "e1",
              "to": "g1"
            }
          },
          {
            "level": 2,
            "fen": "rnbqkbnr/pppppppp/8/8/4P3/1PN5/PBPPQPPP/R3KBNR w KQ - 0 1",
            "optimalMoves": 1,
            "description": "Move your king two squares to castle queen-side!",
            "answerMove": {
              "from": "e1",
              "to": "c1"
            }
          },
          {
            "level": 3,
            "fen": "rnbqkbnr/pppppppp/8/8/8/4P3/PPPPBPPP/RNBQK1NR w KQ - 0 1",
            "optimalMoves": 1,
            "description": "The knight is in the way! Move it, then castle king-side.",
            "answerMove": {
              "from": "e1",
              "to": "g1"
            }
          },
          {
            "level": 4,
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1",
            "optimalMoves": 1,
            "description": "Castle king-side! You need to move out pieces first.",
            "answerMove": {
              "from": "e1",
              "to": "g1"
            }
          },
          {
            "level": 5,
            "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1",
            "optimalMoves": 1,
            "description": "Castle queen-side! You need to move out pieces first.",
            "answerMove": {
              "from": "e1",
              "to": "c1"
            }
          },
          {
            "level": 6,
            "fen": "rnbqkbnr/pppppppp/8/8/3P4/1PN1PN2/PBPQBPPP/R3K1R1 w KQkq - 0 1",
            "optimalMoves": 1,
            "description": "You cannot castle if the king or rook has already moved. Now castle queen-side.",
            "answerMove": {
              "from": "e1",
              "to": "c1"
            }
          }
        ]
      },
      {
        "name": "En passant",
        "description": "Practice en passant captures.",
        "levels": [
          {
            "level": 1,
            "fen": "rnbqkbnr/ppp1pppp/8/2Pp4/8/8/PP1PPPPP/RNBQKBNR w - a6 0 1",
            "optimalMoves": 1,
            "description": "Black just moved the pawn by two squares! Take it en passant.",
            "answerMove": {
              "from": "c5",
              "to": "d6"
            }
          },
          {
            "level": 2,
            "fen": "rnbqkbnr/pppppp1p/8/2P3pP/8/8/PP1PPPP1/RNBQKBNR w - b6 0 1",
            "optimalMoves": 1,
            "description": "En passant only works immediately after the opponent moved the pawn.",
            "answerMove": {
              "from": "h5",
              "to": "g6"
            }
          },
          {
            "level": 3,
            "fen": "rnbqkbnr/p1pppppp/P7/1pP5/8/8/PP1PPPP1/RNBQKBNR w - c6 0 1",
            "optimalMoves": 1,
            "description": "En passant only works if your pawn is on the 5th rank.",
            "answerMove": {
              "from": "c5",
              "to": "b6"
            }
          },
          {
            "level": 4,
            "fen": "rnbqkbnr/p1pppppp/8/1pPPP2P/8/8/PP1P1PP1/RNBQKBNR w - d6 0 1",
            "optimalMoves": 1,
            "description": "Take all the pawns en passant!",
            "answerMove": {
              "from": "c5",
              "to": "b6"
            }
          },
          {
            "level": 5,
            "fen": "rnbqkbnr/ppp1pppp/8/2Pp4/8/8/PP1PPPPP/RNBQKBNR w - a6 0 1",
            "optimalMoves": 1,
            "description": "En passant level 5.",
            "answerMove": {
              "from": "c5",
              "to": "d6"
            }
          },
          {
            "level": 6,
            "fen": "rnbqkbnr/ppp1pppp/8/2Pp4/8/8/PP1PPPPP/RNBQKBNR w - a6 0 1",
            "optimalMoves": 1,
            "description": "En passant level 6.",
            "answerMove": {
              "from": "c5",
              "to": "d6"
            }
          }
        ]
      },
      {
        "name": "Stalemate",
        "description": "Learn stalemate situations.",
        "levels": [
          {
            "level": 1,
            "fen": "k7/8/8/6B1/8/1R6/8/7K w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "g5",
              "to": "e3"
            }
          },
          {
            "level": 2,
            "fen": "8/7p/4N2k/8/8/3N4/8/1K6 w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "d3",
              "to": "f4"
            }
          },
          {
            "level": 3,
            "fen": "4k3/6p1/5p2/p4P2/PpB2N2/1K6/8/3R4 w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "f4",
              "to": "g6"
            }
          },
          {
            "level": 4,
            "fen": "8/6pk/6np/7K/8/3B4/8/1R6 w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "b1",
              "to": "b8"
            }
          },
          {
            "level": 5,
            "fen": "7R/pk6/p1pP4/K7/3BB2p/7p/1r5P/8 w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "d4",
              "to": "b2"
            }
          },
          {
            "level": 6,
            "fen": "k7/8/8/6B1/8/1R6/8/7K w - - 0 1",
            "optimalMoves": 1,
            "description": "To stalemate black: - Black cannot move anywhere - There is no check.",
            "answerMove": {
              "from": "g5",
              "to": "e3"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "Intermediate",
    "stages": [
      {
        "name": "Capture",
        "description": "Learn capturing techniques.",
        "levels": [
          {
            "level": 1,
            "fen": "8/2p2p2/8/8/8/8/2R5/4K2k w - - 0 1",
            "stars": [
              "c7",
              "f7"
            ],
            "optimalMoves": 2,
            "description": "Take the black pieces!"
          },
          {
            "level": 2,
            "fen": "8/8/2r2p2/8/8/5Q2/8/4K2k w - - 0 1",
            "stars": [
              "c6",
              "f6"
            ],
            "optimalMoves": 2,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 3,
            "fen": "8/5r2/8/1r3p2/8/3B4/8/4K2k w - - 0 1",
            "stars": [
              "b5",
              "f5",
              "f7"
            ],
            "optimalMoves": 4,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 4,
            "fen": "8/5b2/5p2/3n2p1/8/6Q1/8/4K2k w - - 0 1",
            "stars": [
              "d5",
              "g5",
              "f6",
              "f7"
            ],
            "optimalMoves": 5,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 5,
            "fen": "8/3b4/2p2q2/8/3p1N2/8/8/4K2k w - - 0 1",
            "stars": [
              "d4",
              "c6",
              "f6",
              "d7"
            ],
            "optimalMoves": 6,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 6,
            "fen": "8/2p2p2/8/8/8/8/2R5/4K2k w - - 0 1",
            "stars": [
              "c7",
              "f7"
            ],
            "optimalMoves": 2,
            "description": "Take the black pieces! And don't lose yours."
          }
        ]
      },
      {
        "name": "Protection",
        "description": "Protect your pieces.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/4bb2/8/8/P2P4/R2K2k1 w - - 0 1",
            "optimalMoves": 1,
            "description": "You're under attack! Escape the threat!"
          },
          {
            "level": 2,
            "fen": "8/8/8/2q2N2/8/8/8/4K2k w - - 0 1",
            "optimalMoves": 2,
            "description": "You're under attack! Escape the threat!"
          },
          {
            "level": 3,
            "fen": "8/N2q4/8/8/8/8/6R1/4K2k w - - 0 1",
            "optimalMoves": 3,
            "description": "There is no escape, but you can defend!"
          },
          {
            "level": 4,
            "fen": "8/8/1Bq5/8/2P5/8/8/4K2k w - - 0 1",
            "optimalMoves": 4,
            "description": "There is no escape, but you can defend!"
          },
          {
            "level": 5,
            "fen": "1r6/8/5b2/8/8/3P1N2/P7/R1B2K1k w - - 0 1",
            "optimalMoves": 5,
            "description": "There is no escape, but you can defend!"
          },
          {
            "level": 6,
            "fen": "7k/1b6/8/8/7K/3P2P1/5NRP/r7 w - - 0 1",
            "optimalMoves": 6,
            "description": "Don't let them take any undefended piece!"
          }
        ]
      },
      {
        "name": "Combat",
        "description": "Engage in combat tactics.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/8/P2r4/6B1/8/4K2k w - - 0 1",
            "stars": [
              "d4"
            ],
            "optimalMoves": 1,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 2,
            "fen": "2r5/8/3b4/2P5/8/1P6/2B5/4K2k w - - 0 1",
            "stars": [
              "c8",
              "d6"
            ],
            "optimalMoves": 2,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 3,
            "fen": "1r6/8/5n2/3P4/4P1P1/1Q6/8/4K2k w - - 0 1",
            "stars": [
              "b8",
              "f6"
            ],
            "optimalMoves": 3,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 4,
            "fen": "2r5/8/3N4/5b2/8/8/PPP5/4K2k w - - 0 1",
            "stars": [
              "c8",
              "f5"
            ],
            "optimalMoves": 4,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 5,
            "fen": "k7/6q1/8/4P1P1/8/4B3/r2P2N1/4K3 w - - 0 1",
            "stars": [
              "a2",
              "g7"
            ],
            "optimalMoves": 5,
            "description": "Take the black pieces! And don't lose yours."
          },
          {
            "level": 6,
            "fen": "8/8/8/8/P2r4/6B1/8/4K2k w - - 0 1",
            "stars": [
              "d4"
            ],
            "optimalMoves": 1,
            "description": "Take the black pieces! And don't lose yours."
          }
        ]
      },
      {
        "name": "Check in one",
        "description": "Deliver check in one move.",
        "levels": [
          {
            "level": 1,
            "fen": "4k3/8/2b5/8/8/8/8/R4K2 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "a1",
              "to": "e1"
            }
          },
          {
            "level": 2,
            "fen": "8/8/4k3/3n4/8/1Q6/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "b3",
              "to": "h3"
            }
          },
          {
            "level": 3,
            "fen": "3qk3/1pp5/3p4/4p3/8/3B4/6r1/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "d3",
              "to": "b5"
            }
          },
          {
            "level": 4,
            "fen": "2r2q2/2n5/8/4k3/8/2NPP3/6B1/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "d3",
              "to": "d4"
            }
          },
          {
            "level": 5,
            "fen": "8/2b1q2n/1ppk4/2N5/8/8/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "c5",
              "to": "b7"
            }
          },
          {
            "level": 6,
            "fen": "6R1/1k3r2/8/4Q3/8/2n5/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Aim at the opponent's king in one move!",
            "answerMove": {
              "from": "e5",
              "to": "b8"
            }
          }
        ]
      },
      {
        "name": "Out of check",
        "description": "Escape from check.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/8/4q3/8/8/8/4K2k w - - 0 1",
            "optimalMoves": 1,
            "description": "Escape with the king!"
          },
          {
            "level": 2,
            "fen": "8/2n5/5b2/8/2K5/8/2q5/7k w - - 0 1",
            "optimalMoves": 1,
            "description": "Escape with the king!"
          },
          {
            "level": 3,
            "fen": "8/7r/6r1/8/R7/7K/8/7k w - - 0 1",
            "optimalMoves": 1,
            "description": "The king cannot escape, but you can block the attack!"
          },
          {
            "level": 4,
            "fen": "8/8/8/3b4/8/4N3/KBn5/1R5k w - - 0 1",
            "optimalMoves": 1,
            "description": "You can get out of check by taking the attacking piece."
          },
          {
            "level": 5,
            "fen": "4q2k/8/8/8/8/5nb1/3PPP2/3QKBNr w - - 0 1",
            "optimalMoves": 1,
            "description": "This knight is checking through your defenses!"
          },
          {
            "level": 6,
            "fen": "8/8/7p/2q5/5n2/1N1KP2r/3R4/7k w - - 0 1",
            "optimalMoves": 1,
            "description": "Escape with the king or block the attack!"
          }
        ]
      },
      {
        "name": "Mate in one",
        "description": "Mate in one move challenge.",
        "levels": [
          {
            "level": 1,
            "fen": "3qk3/3ppp2/8/8/2B5/5Q2/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "f3",
              "to": "f7"
            }
          },
          {
            "level": 2,
            "fen": "6rk/6pp/7P/6N1/8/8/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "g5",
              "to": "f7"
            }
          },
          {
            "level": 3,
            "fen": "R7/8/7k/2r5/5n2/8/6Q1/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "a8",
              "to": "h8"
            }
          },
          {
            "level": 4,
            "fen": "2rb4/2k5/5N2/1Q6/8/8/8/4K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "f6",
              "to": "e8"
            }
          },
          {
            "level": 5,
            "fen": "1r2kb2/ppP1p3/2B2p2/2p1N3/B7/8/8/3RK3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "c6",
              "to": "b7"
            }
          },
          {
            "level": 6,
            "fen": "8/pk1N4/n7/b7/6B1/1r3b2/8/1RR1K3 w - - 0 1",
            "optimalMoves": 1,
            "description": "Attack your opponent's king in a way that cannot be defended!",
            "answerMove": {
              "from": "g4",
              "to": "f3"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "Advanced",
    "stages": [
      {
        "name": "Piece Value",
        "description": "Understand relative piece values.",
        "levels": [
          {
            "level": 1,
            "fen": "8/8/2qrbnp1/3P4/8/8/8/4K2k w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value! Queen > Bishop",
            "answerMove": {
              "from": "d5",
              "to": "c6"
            }
          },
          {
            "level": 2,
            "fen": "8/8/4b3/1p6/6r1/8/4Q3/4K2k w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value! Do not exchange a higher valued piece for a less valuable one.",
            "answerMove": {
              "from": "e2",
              "to": "e6"
            }
          },
          {
            "level": 3,
            "fen": "5b1k/8/6N1/2q5/3Kn3/2rp4/3B4/8 w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value! Make sure your move is legal!",
            "answerMove": {
              "from": "d4",
              "to": "e4"
            }
          },
          {
            "level": 4,
            "fen": "1k4q1/pp6/8/3B4/2P5/1P1p2P1/P3Kr1P/3n4 w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value!",
            "answerMove": {
              "from": "e2",
              "to": "d1"
            }
          },
          {
            "level": 5,
            "fen": "7k/3bqp1p/7r/5N2/6K1/6n1/PPP5/R1B5 w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value!",
            "answerMove": {
              "from": "c1",
              "to": "h6"
            }
          },
          {
            "level": 6,
            "fen": "8/8/2qrbnp1/3P4/8/8/8/4K2k w - - 0 1",
            "optimalMoves": 1,
            "description": "Take the piece with the highest value!",
            "answerMove": {
              "from": "d5",
              "to": "c6"
            }
          }
        ]
      },
      {
        "name": "Check in two",
        "description": "Deliver check in two moves challenge.",
        "levels": [
          {
            "level": 1,
            "fen": "2k5/2pb4/8/2R5/8/8/8/7K w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "c5",
                  "to": "a5"
                },
                {
                  "from": "a5",
                  "to": "a8"
                }
              ],
              [
                {
                  "from": "c5",
                  "to": "g5"
                },
                {
                  "from": "g5",
                  "to": "g8"
                }
              ],
              [
                {
                  "from": "c5",
                  "to": "h5"
                },
                {
                  "from": "h5",
                  "to": "h8"
                }
              ]
            ]
          },
          {
            "level": 2,
            "fen": "8/8/5k2/8/8/1N6/5b2/7K w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "b3",
                  "to": "d2"
                },
                {
                  "from": "d2",
                  "to": "e4"
                }
              ]
            ]
          },
          {
            "level": 3,
            "fen": "6k1/2r3pp/8/1N6/8/8/4B3/7K w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "b5",
                  "to": "d6"
                },
                {
                  "from": "e2",
                  "to": "c4"
                }
              ]
            ]
          },
          {
            "level": 4,
            "fen": "r1bqkb1r/pppp1p1p/2n2np1/4p3/2B5/4PN2/PPPP1PPP/RNBQK2R w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "f3",
                  "to": "g5"
                },
                {
                  "from": "c4",
                  "to": "f7"
                }
              ]
            ]
          },
          {
            "level": 5,
            "fen": "8/8/8/2k5/q7/4N3/3B4/7K w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "e3",
                  "to": "f5"
                },
                {
                  "from": "d2",
                  "to": "e3"
                }
              ]
            ]
          },
          {
            "level": 6,
            "fen": "r6r/1Q2nk2/1B3p2/8/8/8/8/3K4 w - - 0 1",
            "optimalMoves": 2,
            "description": "Threaten the opponent's king in two moves!",
            "solutions": [
              [
                {
                  "from": "b6",
                  "to": "c5"
                },
                {
                  "from": "b7",
                  "to": "e7"
                }
              ]
            ]
          }
        ]
      }
    ]
  }
];
