export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  VALIDATE_TOKEN: 'auth.validateToken',
} as const;

export const MEMO_PATTERNS = {
  CREATE: 'memo.create',
  FIND_ALL: 'memo.findAll',
  FIND_ONE: 'memo.findOne',
  UPDATE: 'memo.update',
  REMOVE: 'memo.remove',
  SEARCH: 'memo.search',
} as const;

export const AI_PATTERNS = {
  SUMMARIZE_AND_TAG: 'ai.summarizeAndTag',
} as const;
