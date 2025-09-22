export type GameEvent =
  | { type: 'BOARD_SELECT'; questionId: string }
  | { type: 'ANSWER_TOGGLE'; show: boolean }
  | { type: 'JUDGE'; teamId: string; questionId: string; correct: boolean; delta: number }
  | { type: 'LOCK'; questionId: string }
  | { type: 'BUZZ'; playerId: string; ts: number }
  | { type: 'ANSWER_SUBMIT'; playerId: string; questionId: string; payload: { text?: string } };

export const EVENTS = {
  BOARD_SELECT: 'BOARD_SELECT',
  ANSWER_TOGGLE: 'ANSWER_TOGGLE',
  JUDGE: 'JUDGE',
  LOCK: 'LOCK',
  BUZZ: 'BUZZ',
  ANSWER_SUBMIT: 'ANSWER_SUBMIT',
} as const;
