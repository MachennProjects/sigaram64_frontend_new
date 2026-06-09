export interface PuzzleExercise {
  id: string;
  description: string;
  FEN: string;
  correctMoves: string;
  hint: string;
}

const intermediateExercises: PuzzleExercise[] = [
  {
    id: "2082978177017914",
    description:
      "Wilhelm Steinitz - Vienna 1860: A win by an unsound combination, however showy, fills me with artistic horror.. Carl Hamppe",
    FEN: "r6r/1pp3k1/1b6/p2P1p2/P1N1pn2/2P2PP1/BP5P/4RR1K b - - 0 1",
    correctMoves: "Rxh2+ Kxh2 Rh8#",
    hint:
      "Black to move. Provide the complete move sequence in algebraic notation – for example: 'Rxh2+ Kxh2..'."
  },
  {
    id: "2082978177017915",
    description: "Wilhelm Steinitz - J. Wilson, London 1862",
    FEN: "rnb3kr/ppp4p/3b3B/3Pp2n/2BP4/3K1Rp1/PPP3q1/RN1Q4 w - - 0 1",
    correctMoves: "Rf8+ Bxf8 d6+ Be6 Bxe6#",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation – for example, 'Rf8+ Bxf8..'."
  },
  {
    id: "2082978177017916",
    description:
      "Wilhelm Steinitz - Serafino Dubois, London (6) 1862: The bishop on d6 is pinned and Steinitz took advantage of that.",
    FEN: "r2q1rk1/pppb1ppp/3b4/4p1P1/4Pn2/2N1B2P/PPPQBP2/2KR3R w - - 0 1",
    correctMoves: "Bxf4 exf4 e5 Bxe5 Qxd7",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation – for example: 'Bxf4 exf4..'."
  },
  {
    id: "2082978177017917",
    description: "Valentine Green - Wilhelm Steinitz, London 1864",
    FEN: "2kr4/1pp4p/1p1r4/5Pp1/1P2q3/2P1R2P/P3KP2/1Q1R4 b - - 0 1",
    correctMoves: "Rd2+",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017918",
    description: "Wilhelm Steinitz George Barry, Dublin (simul) 1865",
    FEN: "rn1qk2r/ppp2ppp/5n2/2b1p3/2B1P1b1/3P1N2/PPP3PP/RNBQK2R w KQkq - 0 1",
    correctMoves: "Bxf7+ Kxf7 Nxe5+",
    hint:
      "White to move. Provide the complete move sequence in algebraic notation – for example: 'Bxf7+..'."
  },
  {
    id: "2082978177083673",
    description:
      "Carl Hamppe - Wilhelm Steinitz, Vienna 1859",
    FEN: "2k3rr/ppp1npb1/2Pp4/P7/1PBP4/2P2QBq/7P/R4RK1 b - - 0 1",
    correctMoves: "Bxd4+ Kh1 Rxg3",
    hint:
      "Black to move. Provide the complete move sequence in algebraic notation – for example: 'Bxd4+..'."
  },
  {
    id: "2082978177083674",
    description: "Wilhelm Steinitz - Strauss, Vienna 1860",
    FEN: "r5r1/pp2kpBQ/3pn3/6q1/8/8/P4PPP/3RR1K1 w - - 0 1",
    correctMoves: "Rxe6+ Kxe6 Qe4+ Kd7",
    hint:
      "White to move. Provide the complete move sequence in algebraic notation – for example: 'Rxe6+ Kxe6..'."
  },
  {
    id: "2082978177083675",
    description: "Wilhelm Steinitz - Adolf Anderssen, London 1862",
    FEN: "8/2R3pk/2N2r1p/1p3p2/1Pb1p2P/8/1r3PP1/R5K1 b - - 0 1",
    correctMoves: "e3 f3 Rg6 g4 fxg4 f4 Bd5 Nd4 Ra6",
    hint:
      "Black to move. Provide the complete move sequence in algebraic notation – for example: 'e3 f3 Rg6..'."
  },
  {
    id: "2082978177083676",
    description:
      "Henry Bird - Wilhelm Steinitz, London (6) 1866",
    FEN: "2kr3r/ppp2p1p/2Bb1p2/3P4/6b1/5N2/PPP3PP/RNqQK2R b KQ - 0 1",
    correctMoves: "Rde8+ Bxe8 Rxe8+ Kf2 Qe3+ Kf1 Bxf3 gxf3 Bc5",
    hint:
      "Black to move. Provide the complete move sequence in algebraic notation – for example: 'Rde8+ Bxe8 Rxe8+..'."
  },
  {
    id: "2082978177083677",
    description:
      "Wilhelm Steinitz - Henry Bird, London (9) 1866",
    FEN: "r1b1kb1r/ppp2ppp/2n1p3/6B1/3P2q1/3B1N2/PPP2PPP/R2QK2R w KQkq - 0 1",
    correctMoves: "h3 Qxg2 Rh2 Qxh2 Nxh2 Nxd4 Bb5+",
    hint:
      "White to move. Provide the full move sequence in algebraic notation – for example, 'h3 Qxg2...'."
  },
  {
    id: "2082978177017924",
    description:
      "George Mackenzie – Wilhelm Steinitz, Vienna 1882: The only drawing move, and easy to find, as Black’s mate threat means White has no other sensible try.",
    FEN: "4r2k/1b3Q1p/p1q3p1/1p4B1/2pb4/8/PPB3PP/5R1K w - - 0 1",
    correctMoves: "Be4 Qxe4 Bf6+ Bxf6 Qxf6+ Kg8 Qf7+ Kh8 Qf6+",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017925",
    description:
      "Joseph Blackburne - Wilhelm Steinitz, London 1883: A crisp finish.",
    FEN: "r1n5/pp2q1kp/2ppr1p1/4p1Q1/8/2N4R/PPP3PP/5RK1 w - - 0 1",
    correctMoves: "Qh6+ Kg8 Rf8+ Qxf8 Qxh7#",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017926",
    description:
      "Isidor Gunsberg - Wilhelm Steinitz, New York (2) 1890: Lost an exchange.",
    FEN: "4rrk1/ppp3pp/3p2n1/3Ppqb1/nPP5/6P1/P1NBQP1P/2R1NEK1 b - - 0 1",
    correctMoves: "Nc3 Bxc3 Bxc1",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017927",
    description:
      "Wilhelm Steinitz - Mikhail Chigorin, Havana (8) 1892: Breaking open the king’s position to close out the game.",
    FEN: "2kr3r/p4pp1/2p4p/4p3/2n4q/1NPPnP1P/PP2Q2P/R1K2B1R b - - 0 1",
    correctMoves: "Rxd3 Bg2 Rhd8 a4 Rd1+ Rxd1 Rxd1+ Qxd1 Nxd1",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017928",
    description:
      "Wilhelm Steinitz - Dirk van Foreest, Haarlem (simul) 1896: Steinitz’s blunder is punished.",
    FEN: "6k1/5pp1/p1n1r2p/2NQ4/1P1p4/P6P/1B1bqPP1/5RK1 b - - 0 1",
    correctMoves: "Qxf1+ Kxf1 Re1#",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017929",
    description:
      "Wilhelm Steinitz - Reyne, Haarlem (simul) 1896: But Black is mated if he takes the knight.",
    FEN: "r1bqk1nr/pppp3p/2n2p2/b5p1/2BPPp1P/2P2N2/P5P1/RNBQK2R w KQkq - 0 1",
    correctMoves: "Nxg5 fxg5 Qh5+ Ke7 Qf7+ Kd6 e5+ Nxe5+ dxe5+ Kxe5 Qd5+ Kf6 Qxg5#",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017930",
    description:
      "Wilhelm Steinitz - Falk, Moscow 1896: White wins an important pawn.",
    FEN: "2kr1bnr/p1ppqp1p/bpn5/1N4p1/P2PPp4/5N2/1PP2KPP/R1BQ1B1R w - - 0 1",
    correctMoves: "Nxa7+ Nxa7 Bxa6+",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017931",
    description:
      "Wilhelm Steinitz - T.J.D. Enderle, Haarlem (simul) 1896: White wins two pawns.",
    FEN: "rn1qk1nr/ppp2ppp/8/2b1p3/2B1P1b1/5N2/PPPP2PP/RNBQK2R w KQkq - 0 1",
    correctMoves: "Bxf7+ Kxf7 Nxe5+",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017932",
    description:
      "Jackson Showalter - Wilhelm Steinitz, Vienna 1898: Black is two pawns up, but that doesn't stop him from being precise.",
    FEN: "1k2r3/2p3p1/p4p2/1p3q1p/1n6/PQ3P3/1P2B2P/2KR4 b - - 0 1",
    correctMoves: "Rxe3 Qxb4 Rxe2",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017934",
    description:
      "Emanuel Lasker - E.W. Witchard, Gloucester (simul) 1908: The only saving line involves a forcing sequence starting with a knight sacrifice.",
    FEN: "rnbqkbnr/pppp3p/5p2/6p1/4Pp1P/5N2/PPPP2P1/RNBQKB1R w KQkq - 0 1",
    correctMoves: "Nxg5 fxg5 Qh5+ Ke7 Qxg5+ Ke8 Qh5+ Ke7 Qe5+ Kf7 Bc4+ Kg6 Qxh8",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017935",
    description:
      "Carl Hartlaub - Emanuel Lasker, Germany 1908: A tactical shot opens up the position for White to dominate with queen and bishop coordination.",
    FEN: "rnbqkb1r/pp1p2pp/2p2p2/4p3/2B5/2P2N2/PPP2PPP/R1BQ1RK1 w kq - 0 1",
    correctMoves: "Nxe5 d5 Qh5+ g6 Nxg6 hxg6 Qxh8 dxc4 Re1+ Kf7 Bh6",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017936",
    description:
      "Emanuel Lasker - Dawid Janowski, Berlin (1) 1910: White wins a piece through tactical exploitation of an overloaded rook.",
    FEN: "2r3k1/p3qppp/2pr4/Q2b4/1P2p3/4P3/P3BPPP/2RR2K1 w - - 0 1",
    correctMoves: "Rxd5 Rxd5 Qxd5",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017937",
    description:
      "Emanuel Lasker - Efim Bogoljubov, Atlantic Ocean 1924: Laskers positional trap wins a pawn and activates the queen.",
    FEN: "6k1/2p3pp/q3pn2/1pp1p3/4P3/1P1P1P2/rNP2P1P/1Q3RK1 w - - 0 1",
    correctMoves: "Na4 Ra3 Qb2 b4 Qxe5",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017938",
    description:
      "George Thomas - Emanuel Lasker, Nottingham 1936: Lasker converts a queen vs queen ending to a winning endgame.",
    FEN: "8/1p3q1k/2p3pp/4P1r1/8/4Q3/PP5P/3R3K b - - 0 1",
    correctMoves: "Rxe5 Qxe5 Qf3+ Kg1 Qxd1+ Kf2 Qd7",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017939",
    description:
      "Jose Raul Capablanca - C.E. Watson, Schenectady 1909: A textbook example of a double threat leading to a decisive advantage.",
    FEN: "r5k1/1b1n2r1/p3n2q/1p1pPRN1/2pP3P/2P3P1/PPBQ4/5R1K w - - 0 1",
    correctMoves: "Rf6 Nxf6 Rxf6 Qh5 Bd1 Qe8 Rxe6",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017940",
    description:
      "Jose Raul Capablanca - E.B. Schrader, Saint Louis (simul) 1909: White gains material with a tactical fork.",
    FEN: "r1b2rk1/p2p1p2/2p5/1p2PPqn/1b1p2N1/1B1P3Q/PPP3PP/R4RK1 w - - 0 1",
    correctMoves: "Qxh5 Qxh5 Nf6+ Kg7 Nxh5+",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017941",
    description:
      "Jose Raul Capablanca - D.W. Pomeroy, Saint Louis (simul) 1909: A mating net seals White's fate.",
    FEN: "r5r1/p1p1k3/3q3B/5p2/4p3/1P6/P1P1QPP1/R4RK1 b - - 0 1",
    correctMoves: "Rxg2+ Kxg2 Rg8+ Kh1 Qxh6+ Qh5 Qxh5#",
    hint:
      "Black to move. Provide the complete move sequence in algebraic chess notation."
  },
  {
    id: "2082978177017942",
    description:
      "Jose Raul Capablanca - T.A. Carter, Saint Louis (simul) 1909: A classic mating pattern involving rook and pawn coordination.",
    FEN: "6rk/p1q2p2/2p1rb1P/1p2pN2/4P1Q1/2PP4/PPB5/2K4R w - - 0 1",
    correctMoves: "Qg7+ Rxg7 hxg7+ Kg8 Rh8#",
    hint:
      "White to move. Provide the complete move sequence in algebraic chess notation."
  }
];

export default intermediateExercises;
