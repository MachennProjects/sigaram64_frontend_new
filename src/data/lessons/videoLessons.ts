export interface VideoLesson {
  id: number;
  chapter: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  locked: boolean;
  driveFileId: string;
}

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 1,
    chapter: "Chapter 1",
    title: "QGD (Classical Mainline) - 5.Bg5 h6 6.Bxf6",
    description: "In this lesson, we explore a key line of the Queen’s Gambit Declined Classical Mainline, where White plays 5.Bg5 followed by 6.Bxf6 after 5...h6. The focus is on the strategic idea of delaying the development of the queen’s knight to keep options flexible. You'll learn the positional motives behind exchanging on f6 early, how Black’s pawn structure is affected, and the long-term plans for both sides.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1fZm-ReeS0EpYOj7-f5nv7OGTiFB1gPS0"
  },
  {
    id: 2,
    chapter: "Chapter 2",
    title: "Line 2 QGD – 5.Bg5 h6 6.Bxf6 (White plays 7.Qd2 #1)",
    description: "This video presents a follow-up idea in the Queen’s Gambit Declined Classical Mainline, where after 6.Bxf6, White opts for 7.Qd2. The lesson dives into the purpose of early queen development — preparing long castling, connecting rooks, and maintaining pressure on the kingside. Key tactical themes and strategic decisions are discussed, highlighting how this variation can lead to aggressive, dynamic play for White. A great continuation from the first video, aimed at players refining their repertoire against the QGD.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1fb49laEr4xmkov5HN1DOCECd8CxxvI8X"
  },
  {
    id: 3,
    chapter: "Chapter 3",
    title: "Line 3 QGD – 5.Bg5 h6 6.Bxf6 (White plays 7.Qd2 #2)",
    description: "In this continuation of the Queen’s Gambit Declined Classical Mainline series, the lesson deepens the analysis of the 7.Qd2 line. Building on the ideas introduced earlier, this video explores alternative plans and tactical nuances that arise after 6.Bxf6 and 7.Qd2. Key themes include potential kingside attacks, the timing of castling, and how White can adapt to Black’s different setups. This is an essential watch for players looking to reinforce their understanding of the variation and broaden their preparation.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1fcmJsCFQVVljT8RTypqYZ7ypJd_Jf7oX"
  },
  {
    id: 4,
    chapter: "Chapter 4",
    title: "Line 4 QGD – 5.Bg5 h6 6.Bxf6 (White Plays 7.e4)",
    description: "This lesson introduces an aggressive and thematic idea in the Classical Mainline of the Queen’s Gambit Declined — the early central thrust 7.e4. After the exchange on f6, White immediately challenges the center, aiming for space and initiative. The video explains the dynamic potential of this approach, including central control, piece activity, and the prospects of a kingside attack. Perfect for players who want to take an active stance and test Black’s setup early.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1fg5jnE9BUhJO1KGj7MVqfHCP1qB7dBhB"
  },
  {
    id: 5,
    chapter: "Chapter 5",
    title: "Line 5 QGD – 5.Bg5 h6 6.Bxf6 (White Plays 7.Qc2)",
    description: "In this video, we examine a flexible and quiet idea in the Classical Mainline of the Queen’s Gambit Declined — the developing move 7.Qc2. By placing the queen on a safe and central square, White keeps multiple options open: long or short castling, central pawn breaks, and improved piece coordination. The lesson discusses strategic plans behind this move and how it fits into White’s overall structure after the Bxf6 exchange. A subtle and positional choice for players who value control and adaptability.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1fiLUxVp05po_xmklqRE5bxCkWpIC6m8c"
  },
  {
    id: 6,
    chapter: "Chapter 6",
    title: "Line 6 QGD – 5.Bg5 h6 6.Bxf6 (White Plays 7.Qc2 #2)",
    description: "This video continues the exploration of the 7.Qc2 idea in the Queen’s Gambit Declined Classical Mainline. It covers deeper lines, possible responses from Black, and how White should adjust their plans accordingly. With an emphasis on flexibility and positional awareness, the lesson highlights how Qc2 supports both central play and queenside development, while delaying commitment. A valuable addition for players who want to master this nuanced and balanced continuation.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1flzUZBBLZA9CoTYVJSniK2mE1GggUhsr"
  },
  {
    id: 7,
    chapter: "Chapter 7",
    title: "Line 7 QGD – 7.Qb3 Plan Explained",
    description: "In this lesson, we delve into the strategic concept behind 7.Qb3 in the Queen’s Gambit Declined Classical Mainline. White’s plan centers around applying immediate pressure on the b7-pawn, keeping Black’s queenside passive, and delaying knight development to maintain flexibility. The Qb3 move also discourages early breaks like ...c5, while preparing for long-term central and queenside play.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1nlTGGOpgThvU4II7_bLGDWViJUK9Jz-b"
  },
  {
    id: 8,
    chapter: "Chapter 8",
    title: "Line 8 QGD – 7.e3, 8.Qd2 Plan",
    description: "In this line of the Queen’s Gambit Declined Classical Mainline, White adopts a solid setup with 7.e3 followed by 8.Qd2, preparing long castling and keeping central structure intact. This system aims for flexibility, development harmony, and potential kingside play. White’s Plans: Play Be2, O-O-O, and prepare rook lifts. Use Qd2 to connect rooks early and hint at kingside expansion.",
    duration: "10:00",
    level: "Intermediate",
    locked: false,
    driveFileId: "1njkvuYWmeiGGeAjtAuMqJCCM-luYTzuQ"
  }
];

export const getDriveEmbedUrl = (driveFileId: string): string => {
  return `https://drive.google.com/file/d/${driveFileId}/preview`;
};
