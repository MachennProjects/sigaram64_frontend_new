export interface PuzzleExercise {
  id: string;
  description: string;
  FEN: string;
  correctMoves: string;
  hint: string;
}

const advancedExercises: PuzzleExercise[] = [
  {
    id: "2082978177322005",
    description: "Wilhelm Steinitz – Philipp Meitner, Vienna 1859",
    FEN: "r1b1k1r1/ppppnpq1/8/n3P2p/2B4N/5QB1/P4PP1/3RR1K1 w q - 0 1",
    correctMoves: "e6 dxe6 Bb5+ c6 Bc7 Bd7 Bxa5 Qg4 Qd3 Nd5 Re4",
    hint: "White to move. Provide the full move sequence using standard algebraic notation. Example: 'e6 dxe6 Bb5+ c6'."
  },
  {
    id: "2082978177322006",
    description: "Johannes Zukertort – Wilhelm Steinitz, London (1) 1872",
    FEN: "r2q2k1/pp1b1rpp/1b1Q1p2/4N1B1/4R3/8/PP3PPP/4R1K1 b - - 0 1",
    correctMoves: "Bxf2+ Kh1 Be8 Nxf7 Bxf7 Qxd8+ Rxd8",
    hint: "Black to move. Example: 'Bxf2+ Kh1 Be8 Nxf7 Bxf7 Qxd8+ Rxd8'."
  },
  {
    id: "2082978177322007",
    description: "Wilhelm Steinitz – Curt von Bardeleben, Hastings 1895",
    FEN: "r1r5/pp1qnkpp/4Np2/3p4/8/8/PP2QPPP/2R1R1K1 w - - 0 1",
    correctMoves: "Qg4 g6 Ng5+ Ke8 Rxe7+ Kf8 Rf7+ Kg8 Rg7+ Kh8 Rxh7+ Kg8 Rg7+ Kh8 Qh4+ Kxg7 Qh7+ Kf8 Qh8+ Ke7 Qg7+ Ke8 Qg8+ Ke7 Qf7+ Kd8 Qf8+ Qe8 Nf7+ Kd7 Qd6#",
    hint: "White to move. Enter the complete move sequence. For example: 'Qg4 g6 Ng5+ Ke8'."
  },
  {
    id: "2082978177322008",
    description: "Wilhelm Steinitz – Emanuel Lasker, Moscow (3) 1896",
    FEN: "4r3/1kp5/1pb5/p2q1PB1/P1pP3p/2P4P/3Q3K/5R2 b - - 0 1",
    correctMoves: "Rg8 Re1 Qxf5 Re5 Qf3 d5 Qg3+ Kh1 Qxe5 dxc6+ Kxc6",
    hint: "Black to move. Enter the complete move sequence. For example: 'Rg8 Re1 Qxf5 Re5'."
  },
  {
    id: "2082978177322009",
    description: "Paul Lipke – Wilhelm Steinitz, Vienna 1898",
    FEN: "r1bq1k2/ppp2rbp/2np1pp1/3N4/2Q1P3/5NB1/PPP2PPP/3RR1K1 w - - 0 1",
    correctMoves: "Nxc7 Rxc7 Bxd6+ Re7 e5 fxe5",
    hint: "White to move. Enter the complete move sequence. For example: 'Nxc7 Rxc7 Bxd6+ Re7'."
  },
  {
    id: "2082978177322010",
    description: "Emanuel Lasker – Johann Bauer, Amsterdam 1889",
    FEN: "r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 1",
    correctMoves: "Bxh7+ Kxh7 Qxh5+ Kg8 Bxg7 Kxg7 Qg4+ Kh7 Rf3 e5 Rh3+ Qh6 Rxh6+ Kxh6 Qd7",
    hint: "White to move. Enter the complete move sequence. For example: 'Bxh7+ Kxh7 Qxh5+ Kg8'."
  },
  {
    id: "2082978177322011",
    description: "Emanuel Lasker – Joseph Blackburne, London 1892",
    FEN: "r5k1/6np/p2q2pB/1ppr5/3p1PP1/3P3P/PP4Q1/R3R1K1 w - - 0 1",
    correctMoves: "Re7 Ne6 Re1 Qxe7 Qxd5 Re8 f5",
    hint: "White to move. Enter the complete move sequence. For example: 'Re7 Ne6 Re1 Qxe7'."
  },
  {
    id: "2082978177322012",
    description: "Emanuel Lasker – Hasselblatt, Riga (simul) 1909",
    FEN: "r5k1/6np/p2q2pB/1ppr5/3p1PP1/3P3P/PP4Q1/R3R1K1 w - - 0 1",
    correctMoves: "Bg6 Re7 h6 Bc1 Bxh7+ Kf8 hxg7+ Kd7 g8=Q+ Kd7 Qxe6+ Rxe6 Rg7+ Kc6 Nd4+ Kc5 Nxe6+ Bxe6 Rc7+ Kd4 Qg1+ Be3 Rd2+ cxd2 c3#",
    hint: "White to move. Enter the complete move sequence. For example: 'Bg6 Re7 h6 Bc1'."
  },
  {
    id: "2082978177322013",
    description: "Emanuel Lasker – L. Molina, Buenos Aires (simul) 1910",
    FEN: "r1bq1k2/ppp2rbp/2np1pp1/3N4/2Q1P3/5NB1/PPP2PPP/3RR1K1 w - - 0 1",
    correctMoves: "Qxf7+ Qxf7 Bxf7+ Kh8 Rb1 Rb8 Be8 Rxb7 Rxb7 Nxb7 Bxc6",
    hint: "White to move. Enter the complete move sequence. For example: 'Qxf7+ Qxf7 Bxf7+ Kh8'."
  },
  {
    id: "2082978177326111",
    description:
      "Emanuel Lasker – Efim Bogoljubov, Zurich 1934: Black must play a sharp combination involving only-moves to convert their advantage, starting with a bishop sacrifice.",
    FEN: "4r1k1/2q2ppp/p1pb4/3p4/1P6/1NP2PPb/P2Q1R1P/4N1K1 b - - 0 1",
    correctMoves: "Bxg3 Re2 Bxh2+ Kh1 Rxe2 Qxe2 Bd6",
    hint:
      "Black to move. Calculate a forcing line involving a bishop sacrifice and exploiting White's weakened kingside."
  },
  {
    id: "2082978177326112",
    description:
      "Jose Raul Capablanca – Pagliano/Elias, Buenos Aires 1911: Despite appearing under pressure, Black can turn the tables with precise tactical play and coordination of pieces.",
    FEN: "r6r/1b4p1/p1p4p/1p1nq3/1b6/kPP2Q2/2KB1PPP/3R3R b - - 0 1",
    correctMoves: "Bxc3 Bxc3 Nb4+ Kb1 c5",
    hint:
      "Black to move. Look for a sequence that eliminates White's bishop and activates your pieces with tempo."
  },
  {
    id: "2082978177326113",
    description:
      "Valentin Fernandez Coria – Jose Raul Capablanca, Buenos Aires 1914: Black finds a direct attacking line involving discovered threats and a mating net.",
    FEN: "r1br2k1/ppp2pp1/5q1p/4p3/2N1Pn2/2PB4/P1PQ1PPP/R4RK1 b - - 0 1",
    correctMoves: "Bh3 Ne3 Bxg2 Nf5 Bxe4 Ng3 Nh3#",
    hint:
      "Black to move. Focus on a kingside attack, using discovered threats and mating motifs."
  },
  {
    id: "2082978177326114",
    description:
      "Nikolay Tereshchenko – Alexander Alekhine, St Petersburg 1909: A beautiful tactical shot where Black sacrifices material to break through with a powerful attack.",
    FEN: "r3k2r/4bp2/pp1p2np/2pPp1pn/2P1P3/P1NBBPPq/1P3Q1P/4NR1K b kq - 0 1",
    correctMoves: "Ngf4 gxf4 Rg8 Ng2 Bh4 Nd1 Bxf2 Rxf2",
    hint:
      "Black to move. Aim to expose the White king using knight sacrifices and rook pressure."
  },
  {
    id: "2082978177326115",
    description:
      "Alexander Alekhine – Max Euwe, Netherlands 1937: After a tactical shot, White builds pressure through piece activity. A long forcing line with material imbalances follows.",
    FEN: "r4rk1/1q1nbppp/p1b1pn2/1p6/1P5Q/2N1BNP1/P3PPGB/2RR1K1/2RR1G1K w - - 0 1",
    correctMoves:
      "Rxd7 Bxd7 Ng5 Qb8 Nxh7 Rc8 Ng5 Bc6 Nce4 Bxe4 Rxc8+ Qxc8 Bxe4 Rb8 Bd4 Qc1+ Kg2 Rd8 Bh7+ Kf8 Bg6 Rxd4 Qh8+ Ng8 Nh7+ Ke8 Qxg8+ Kd7 Qxf7",
    hint:
      "White to move. Initiate with a rook sacrifice and follow through with active piece play and an attack on the king."
  },
  {
    id: "2082978177326116",
    description:
      "Joel Fridlizius – Alexander Alekhine, Stockholm 1912: White sacrifices a knight and opens a devastating attack, finishing with a neat checkmate.",
    FEN: "1br2rk1/1b2qpp1/p5n1/1p1p5/3p1P1N/1B5P/PP4PK/3RR3 w - - 0 1",
    correctMoves: "Nf6+ gxf6 exf6 Bxf4+ Qxf4 Qxe1 Nxg6 Qe4 Ne7+ Kh8 Rxd4 Qh7 Qh4 Rc4 Bxc4 dxc4 Qxh7+ Kxh7 Rh4#",
    hint:
      "White to move. Play begins with a knight sacrifice to open up the king and ends in a forced checkmate."
  },
  {
    id: "2082978177326117",
    description:
      "P. Fleissig – Alexander Alekhine, Bern (simul) 1922: Black opens a direct attack on the king. One wrong capture and it's mate!",
    FEN: "r4r1k/pp4pp/2pp1q2/8/3P1nb1/4RN2/PPB2PPP/3QR1K1 b - - 0 1",
    correctMoves: "Nh3+ Kf1 Qh4 Qe2 Qh5",
    hint:
      "Black to move. Look for a forcing sequence that opens lines and creates a decisive threat to the king."
  },
  {
    id: "2082978177326118",
    description:
      "Ernst Grünfeld – Alexander Alekhine, Karlsbad 1923: A tactical blow with a knight followed by crushing central control.",
    FEN: "2q3k1/5pb1/p5pp/1p6/3rP3/P2nP3/NP2Q1PP/3R2K1 b - - 0 1",
    correctMoves: "Nf4 exf4 Qc4 Qxc4 Rxd1+ Qf1 Bd4+ Kh1 Rxf1#",
    hint:
      "Black to move. Use tactical threats on the queen and back rank to gain material and deliver mate."
  },
  {
    id: "2082978177326119",
    description:
      "Alexander Alekhine – M. Scholtz, Los Angeles (simul) 1932: Black begins with a pawn thrust and develops a quick mating net.",
    FEN: "5k2/p5p1/6p1/5p2/P1N5/2PpKP2/r3b1PP/4R3 b - - 0 1",
    correctMoves: "f4+ Kf2 Bd1+ Kf1 Bb3 Nd6 Kg8",
    hint:
      "Black to move. Initiate with a check and look for a path that forces promotion or mate threats."
  },
  {
    id: "2082978177326120",
    description:
      "Alexander Alekhine – A. Correia Neves, Estoril (simul) 1940: Knight jumps create chaos in Black’s position and lead to a material win.",
    FEN: "5q1k/pp2rpp1/2pN1n1p/3n5/3P3R/P2Q3P/1P3PP1/6K1 w - - 0 1",
    correctMoves: "Ndxf7+ Kg8 Nh8 Rxe5 dxe5",
    hint:
      "White to move. Start with a knight sacrifice that opens access to the enemy king and wins material."
  }
];

export default advancedExercises;
