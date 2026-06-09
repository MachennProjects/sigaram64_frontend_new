export interface ParsedGame {
  headers: Record<string, string>;
  moves: Array<{
    san: string;
    color: 'w' | 'b';
    from: string;
    to: string;
    fen: string;
    fenBefore: string;
    comment?: string;
  }>;
  startFen: string;
  startComment?: string;
}
