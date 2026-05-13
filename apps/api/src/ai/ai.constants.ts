// 캐시 TTL: 24시간 (ms)
export const AI_CACHE_TTL = 60 * 60 * 24 * 1000;

// Rate limiting: 분당 10회
export const RATE_LIMIT_TTL = 60;
export const RATE_LIMIT_MAX = 10;

// Claude API 프롬프트
export const SUMMARIZE_PROMPT = `다음 메모 내용을 분석해서 JSON 형식으로 응답해주세요.

1. summary: 3줄 이내로 핵심 내용을 요약 (한국어)
2. tags: 내용을 대표하는 태그 최대 5개 (한국어, 짧은 단어)

반드시 아래 JSON 형식만 응답하세요. 다른 텍스트는 포함하지 마세요.
{"summary": "요약 내용", "tags": ["태그1", "태그2"]}

메모 내용:
`;
