export interface BasicQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
}

export interface BasicQuestionBank {
  english: { questions: BasicQuestion[] };
  tamil: { questions: BasicQuestion[] };
}

const basicQuestions: BasicQuestionBank = {
  english: {
    questions: [
      {
        question: 'Where did the game of chess originate?',
        options: ['China', 'India', 'Russia', 'Persia'],
        correctAnswer: 'B'
      },
      {
        question: 'What is the main objective of a chess game?',
        options: ['To capture all opponents pieces', 'To checkmate the opponents king', 'To control the center squares', 'To reach the 8th rank with a pawn'],
        correctAnswer: 'B'
      },
      {
        question: 'What is the total number of squares on a chessboard?',
        options: ['36', '64', '72', '81'],
        correctAnswer: 'B'
      },
      {
        question: 'How many chessmen does each player have at the beginning of the game?',
        options: ['14', '16', '18', '20'],
        correctAnswer: 'B'
      },
      {
        question: 'Which side of the board is known as the Kings side?',
        options: ['The left side from each players view', 'The right side from each players view', 'The side where the queen is placed', 'The side where pawns are placed'],
        correctAnswer: 'B'
      },
      {
        question: 'How many pawns does each player start with?',
        options: ['6', '8', '10', '12'],
        correctAnswer: 'B'
      },
      {
        question: 'What color square should be on the bottom-right corner when placing the board?',
        options: ['Black', 'White', 'Doesnot matter', 'Alternating'],
        correctAnswer: 'B'
      },
      {
        question: 'Which piece starts from d1 for White?',
        options: ['King', 'Queen', 'Bishop', 'Knight'],
        correctAnswer: 'B'
      },
      {
        question: 'Which piece moves diagonally only?',
        options: ['Rook', 'Knight', 'Bishop', 'Pawn'],
        correctAnswer: 'C'
      },
      {
        question: 'How many rooks does each side have at the start?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 'B'
      },
      {
        question: 'How does the rook move in a chess game?',
        options: ['Diagonally', 'In an L-shape', 'Horizontally and vertically', 'One square in any direction'],
        correctAnswer: 'C'
      },
      {
        question: 'Which of these moves is illegal for a rook?',
        options: ['Moving from a1 to a5', 'Moving from d4 to h4', 'Moving from e3 to g5', 'Moving from c6 to c1'],
        correctAnswer: 'C'
      },
      {
        question: 'Can a rook jump over another piece in its path?',
        options: ["Yes, if it's a knight", "Yes, if it's the same color", 'No, never', 'Yes, but only during castling'],
        correctAnswer: 'C'
      },
      {
        question: 'How many rooks does each player start with?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 'B'
      },
      {
        question: 'Can a rook capture an enemy piece?',
        options: ['Only if adjacent', 'No', "Yes, if it's on the same rank or file", 'Only if the piece is a pawn'],
        correctAnswer: 'C'
      },
      {
        question: 'If a white rook is on d4, which square is a legal move?',
        options: ['e5', 'c3', 'd7', 'f5'],
        correctAnswer: 'C'
      },
      {
        question: 'Can a rook move to any square on a clear board from the center (d4)?',
        options: ['Only to diagonals', 'Only 1 square', 'To all squares on the same rank and file', 'Nowhere'],
        correctAnswer: 'C'
      },
      {
        question: 'What happens if an enemy pawn is on the same file as your rook with empty squares in between?',
        options: ['Rook cannot capture', 'Rook can jump over it', 'Rook can capture it by moving to its square', 'Rook is blocked permanently'],
        correctAnswer: 'C'
      },
      {
        question: 'Which of these pieces is captured by a rook in the fewest moves from e1 on an empty board?',
        options: ['Bishop on h4', 'Pawn on a7', 'Knight on e8', 'Queen on d2'],
        correctAnswer: 'C'
      },
      {
        question: 'What is a common strategic use of the rook in endgames?',
        options: ['Blocking pawns', 'Forking', 'Rook lift and open files', 'Sacrificing early'],
        correctAnswer: 'C'
      },
      {
        question: 'How does a bishop move in chess?',
        options: ['In a straight line horizontally or vertically', 'Diagonally, any number of squares', 'In an L-shape', 'One square in any direction'],
        correctAnswer: 'B'
      },
      {
        question: 'Can a bishop move across both white and black squares in a single game?',
        options: ['Yes', 'Only if promoted', 'No', 'Only at the start'],
        correctAnswer: 'C'
      },
      {
        question: "What happens if a friendly piece is on a bishop's diagonal path?",
        options: ['The bishop captures it', 'The bishop jumps over it', 'The bishop stops before it', 'The bishop moves past it'],
        correctAnswer: 'C'
      },
      {
        question: 'Where are bishops placed at the start of a chess game for White?',
        options: ['b1 and g1', 'c1 and f1', 'd1 and e1', 'a1 and h1'],
        correctAnswer: 'B'
      },
      {
        question: 'Which piece can a bishop not capture in one move from d4 on an empty board?',
        options: ['Pawn on g7', 'Queen on b2', 'Knight on d6', 'Rook on h8'],
        correctAnswer: 'C'
      },
      {
        question: 'Can a bishop move to a square not on its diagonal path?',
        options: ['Yes, in some cases', 'No, never', 'Only during castling', 'If promoted'],
        correctAnswer: 'B'
      },
      {
        question: 'If the bishop is on a3, which of these is a legal destination square?',
        options: ['a7', 'd6', 'f3', 'h8'],
        correctAnswer: 'B'
      },
      {
        question: 'How many total bishops are on the board at the start of the game?',
        options: ['4', '6', '2', '8'],
        correctAnswer: 'A'
      },
      {
        question: 'What does a bishop need in order to be effective?',
        options: ['Open diagonals', 'Knight support', 'Closed pawn structures', 'Corner squares'],
        correctAnswer: 'A'
      },
      {
        question: 'Can a bishop give check to the king?',
        options: ['No', 'Only when castling', 'Yes', 'Only with a pawn promotion'],
        correctAnswer: 'C'
      }
    ]
  },
  tamil: {
    questions: [
      {
        question: 'சதுரங்கம் எந்த நாட்டில் தோன்றியது?',
        options: ['சீனா', 'இந்தியா', 'ரஷ்யா', 'பெர்ஷியா'],
        correctAnswer: 'B'
      },
      {
        question: 'சதுரங்க விளையாட்டின் முக்கிய இலக்கு என்ன?',
        options: ['எதிரியின் அனைத்து துண்டுகளையும் பிடித்துவிடுதல்', 'எதிரியின் ராஜாவை செக்மேட் செய்தல்', 'மைய சதுரங்களை கட்டுப்படுத்தல்', 'ஒரு காயத்தை 8வது வரிசைக்கு கொண்டு சேர்த்தல்'],
        correctAnswer: 'B'
      },
      {
        question: 'சதுரங்கப் பலகையில் மொத்தமாக எத்தனை சதுரங்கள் உள்ளன?',
        options: ['36', '64', '72', '81'],
        correctAnswer: 'B'
      },
      {
        question: 'விளையாட்டின் தொடக்கத்தில் ஒவ்வொரு வீரரிடமும் எத்தனை காய்கள் இருக்கும்?',
        options: ['14', '16', '18', '20'],
        correctAnswer: 'B'
      },
      {
        question: 'பலகையின் எந்த பக்கம் ராஜாவின் பக்கம் என அழைக்கப்படுகிறது?',
        options: ['ஒவ்வொரு வீரரின் பார்வையில் இடது பக்கம்', 'ஒவ்வொரு வீரரின் பார்வையில் வலது பக்கம்', 'ராணி வைக்கப்படும் பக்கம்', 'பியாதிகள் வைக்கப்படும் பக்கம்'],
        correctAnswer: 'B'
      },
      {
        question: 'ஒவ்வொரு வீரரும் எத்தனை பியாதிகளுடன் தொடங்குகிறார்கள்?',
        options: ['6', '8', '10', '12'],
        correctAnswer: 'B'
      },
      {
        question: 'பலகையை அமைக்கும்போது கீழ் வலது மூலையில் எந்த நிற சதுரம் இருக்க வேண்டும்?',
        options: ['கருப்பு', 'வெள்ளை', 'வேண்டாம்', 'மாறி மாறி'],
        correctAnswer: 'B'
      },
      {
        question: 'வெள்ளை வீரருக்கு d1 சதுரத்திலிருந்து தொடங்கும் துண்டு எது?',
        options: ['ராஜா', 'ராணி', 'பிஷப்', 'நைட்'],
        correctAnswer: 'B'
      },
      {
        question: 'diagonally மட்டும் நகரும் துண்டு எது?',
        options: ['ரூக்', 'நைட்', 'பிஷப்', 'பியாது'],
        correctAnswer: 'C'
      },
      {
        question: 'ஒவ்வொரு பக்கமும் தொடக்கத்தில் எத்தனை ரூக்குகள் இருக்கின்றன?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 'B'
      },
      {
        question: 'சதுரங்கத்தில் ரூக் எப்படிச் நகரும்?',
        options: ['சாய்வாக', 'எல் வடிவத்தில்', 'கிடைமட்டமாக மற்றும் நெடுவட்டமாக', 'ஓர் திசையில் ஒரு சதுரம்'],
        correctAnswer: 'C'
      },
      {
        question: 'ரூக்குக்கு கீழ்காணும் எது தவறான நகர்வாகும்?',
        options: ['a1 இலிருந்து a5 க்கு நகர்தல்', 'd4 இலிருந்து h4 க்கு நகர்தல்', 'e3 இலிருந்து g5 க்கு நகர்தல்', 'c6 இலிருந்து c1 க்கு நகர்தல்'],
        correctAnswer: 'C'
      },
      {
        question: 'தன் பாதையில் உள்ள மற்ற துண்டுகளின் மீது ரூக் குதிக்க முடியுமா?',
        options: ['ஆம், அது நைட் என்றால்', 'ஆம், அது அதே நிறமுடையது என்றால்', 'இல்லை, ஒருபோதும் முடியாது', 'ஆம், ஆனால் கேஸ்லிங் செய்யும்போது மட்டும்'],
        correctAnswer: 'C'
      },
      {
        question: 'ஒவ்வொரு வீரரும் தொடக்கத்தில் எத்தனை ரூக்குகளை வைத்திருக்கிறார்கள்?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 'B'
      },
      {
        question: 'ரூக் ஒரு எதிரியின் துண்டை பிடிக்க முடியுமா?',
        options: ['அருகிலிருப்பின் மட்டும்', 'இல்லை', 'ஆம், அது அதே வரிசையிலோ, அதே நீளத்திலோ இருந்தால்', 'பியாதி என்றால் மட்டும்'],
        correctAnswer: 'C'
      },
      {
        question: 'வெள்ளை ரூக் d4 இல் இருக்கும்போது, எந்த சதுரம் ஒரு சட்டப்படி நகர்வு ஆகும்?',
        options: ['e5', 'c3', 'd7', 'f5'],
        correctAnswer: 'C'
      },
      {
        question: 'தெளிவான பலகையில் மையமான இடமான d4 இலிருந்து ரூக் எந்த சதுரங்களுக்கும் நகர முடியுமா?',
        options: ['சாய்வாக மட்டும்', 'ஒரு சதுரம் மட்டும்', 'அதே வரிசை மற்றும் நீளத்தில் உள்ள அனைத்து சதுரங்களுக்கும்', 'எங்கும் இல்லாமல்'],
        correctAnswer: 'C'
      },
      {
        question: 'தொடர்ச்சியான காலியிடங்களுடன் உங்கள் ரூக்குடன் ஒரே நீளத்தில் ஒரு எதிரியின் பியாதி இருந்தால் என்ன நடக்கும்?',
        options: ['ரூக் பிடிக்க முடியாது', 'ரூக் அதன் மீது குதிக்க முடியும்', 'ரூக் அதன் சதுரத்திற்கு நகர்ந்து பிடிக்க முடியும்', 'ரூக் நிரந்தரமாக முடக்கப்பட்டுவிடும்'],
        correctAnswer: 'C'
      },
      {
        question: 'காலியான பலகையில் e1 லிருந்து குறைந்த நகர்வுகளில் ரூக் எதை பிடிக்க முடியும்?',
        options: ['h4 இல் பிஷப்', 'a7 இல் பியாதி', 'e8 இல் நைட்', 'd2 இல் குயின்'],
        correctAnswer: 'C'
      },
      {
        question: 'எண்ட்கேம் நிலையில் ரூக்கின் பொதுவான உத்தி என்ன?',
        options: ['பியாதிகளை தடுக்க', 'பிளவு அடிக்க', 'ரூக் லிப்ட் மற்றும் ஓபன் கோடுகள்', 'தொடக்கத்தில் தியாகம் செய்ய'],
        correctAnswer: 'C'
      },
      {
        question: 'சதுரங்கத்தில் பிஷப் எப்படிச் நகரும்?',
        options: ['நேராக, கிடைமட்டமாக அல்லது நெடுவட்டமாக', 'சாய்வாக, எந்த எண்ணிக்கையிலான சதுரங்களையும்', 'எல் வடிவத்தில்', 'ஓர் திசையில் ஒரு சதுரம்'],
        correctAnswer: 'B'
      },
      {
        question: 'ஒரு சதுரங்க விளையாட்டில் பிஷப் வெள்ளை மற்றும் கருப்பு இரு நிற சதுரங்களிலும் நகர முடியுமா?',
        options: ['ஆம்', 'பதவி உயர்ந்தால் மட்டும்', 'இல்லை', 'தொடக்கத்தில் மட்டும்'],
        correctAnswer: 'C'
      },
      {
        question: "பிஷப்பின் சாய்வான பாதையில் நண்பன் துண்டு இருந்தால் என்ன நடக்கும்?",
        options: ['பிஷப் அதை பிடிக்கும்', 'பிஷப் அதைக் குதிக்கின்றது', 'பிஷப் அதன் முன் நிற்கிறது', 'பிஷப் அதை கடந்து நகர்கிறது'],
        correctAnswer: 'C'
      },
      {
        question: 'வெள்ளை வீரருக்கான சதுரங்க விளையாட்டின் தொடக்கத்தில் பிஷப்புகள் எங்கு வைக்கப்படுகின்றன?',
        options: ['b1 மற்றும் g1', 'c1 மற்றும் f1', 'd1 மற்றும் e1', 'a1 மற்றும் h1'],
        correctAnswer: 'B'
      },
      {
        question: 'தெளிவான பலகையில் d4 இலிருந்து பிஷப் ஒரே நகர்வில் பிடிக்க முடியாத துண்டு எது?',
        options: ['g7 இல் பியாதி', 'b2 இல் குயின்', 'd6 இல் நைட்', 'h8 இல் ரூக்'],
        correctAnswer: 'C'
      },
      {
        question: 'பிஷப் தனது சாய்வான பாதையில் இல்லாத சதுரத்திற்கு நகர முடியுமா?',
        options: ['ஆம், சில சமயங்களில்', 'இல்லை, ஒருபோதும் முடியாது', 'கேஸ்லிங் செய்யும்போது மட்டும்', 'பதவி உயர்ந்தால்'],
        correctAnswer: 'B'
      },
      {
        question: 'பிஷப் a3 இல் இருந்தால், இவற்றில் எந்த சதுரம் சட்டப்படி நகர்வாகும்?',
        options: ['a7', 'd6', 'f3', 'h8'],
        correctAnswer: 'B'
      },
      {
        question: 'விளையாட்டின் தொடக்கத்தில் பலகையில் மொத்தம் எத்தனை பிஷப்புகள் உள்ளன?',
        options: ['4', '6', '2', '8'],
        correctAnswer: 'A'
      },
      {
        question: 'பிஷப் விளைவாக இருக்க என்ன தேவை?',
        options: ['திறந்த சாய்வான கோடுகள்', 'நைட் ஆதரவு', 'மூடப்பட்ட பியாதி அமைப்புகள்', 'முகப்பு சதுரங்கள்'],
        correctAnswer: 'A'
      },
      {
        question: 'பிஷப் ராஜாவுக்கு செக் கொடுக்க முடியுமா?',
        options: ['இல்லை', 'கேஸ்லிங் செய்யும்போது மட்டும்', 'ஆம்', 'பியாதி பதவி உயர்ந்தால் மட்டும்'],
        correctAnswer: 'C'
      }
    ]
  }
};

export default basicQuestions;
