// 기본 프롬프트 템플릿
// 로컬 스토리지에 저장된 프롬프트가 없을 때 사용됩니다.

export const DEFAULT_FEMALE_PROMPT = `나는 여성 패션 버티컬 커머스 "아엔 컬렉션"을 운영하고 있어.
타겟은 20~30대 여성이고, 러블리/캐주얼 스타일이야.

아래 상품 사진을 보고 상세페이지 문구를 작성해줘.

---

## [상품 정보]
- 상품 종류: 사진을 보고 판단해줘
- 소재: 사진을 보고 판단해줘
- 특이사항: {{features}}
- 사이즈: {{size}}
- 컬러: {{colors}}

---

## [출력 형식 - 반드시 아래 JSON 형식으로만 출력해]

{
  "productName": "[후킹키워드/후킹키워드] 아엔 여성 + 상품종류 + 특징 + 스타일",
  "hookingCopy": "10~20자 한 줄 카피",
  "sizeColor": "사이즈 | 컬러1 · 컬러2 · 컬러3",
  "sellingPoints": [
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."},
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."},
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."}
  ],
  "outfitCopies": ["문구1", "문구2", ...], // {{outfitImageCount}}개 생성 (코디컷 이미지 개수만큼)
  "detail": {
    "material": "소재 정보",
    "fit": "핏 정보",
    "detail": "디테일 정보",
    "etc": "기타 정보"
  }
}

JSON 외에 다른 텍스트 출력하지 마.

---

## [톤 & 스타일 규칙]

### 전체 톤
- 차분하고 신뢰감 있게
- 브랜드가 고객에게 설명하는 느낌
- 고급스럽고 세련된 단어 선택

### 말투
- **~합니다, ~입니다** 체 사용
- "~해요", "~예요" 사용 금지

---

## [고급스러운 문장 작성 공식]

1. 명사에 "감(感)" 붙이기 → 고급스러움
   - 무게 → 무게감, 컬러 → 컬러감, 터치 → 터치감

2. 영어 차용어 적절히 사용 → 세련됨
   - 부드러운 → 소프트한, 자연스러운 → 내추럴한

3. "~을 자랑합니다" 마무리 → 브랜드 자신감
   - "~해 보입니다" 금지

4. 제품 특성 → 결론 순서로 작성
   - 효과 직접 언급 X ("슬림해 보입니다" 금지)

### 적용 예시
"가벼운 무게감과 소프트한 컬러감으로 높은 활용도를 자랑합니다."

---

## [셀링포인트 작성법]

### 구조
- 제품 특성 먼저 → 자연스럽게 결론
- 직접적인 효과 언급 X

### 좋은 예시
"title": "페미닌 라인"
"desc": "허리 라인을 따라 내추럴하게 떨어지는 실루엣을 자랑합니다. 하이웨스트 디자인으로 세련된 무드를 연출합니다."

"title": "소프트 터치"
"desc": "고밀도 니트 원단의 소프트한 터치감을 자랑합니다. 가벼운 무게감으로 하루 종일 이지한 착용감을 유지합니다."

"title": "데일리 무드"
"desc": "차분한 컬러감으로 어떤 하의와도 자연스러운 코디를 완성합니다. 단독 또는 아우터 속 이너로 높은 활용도를 자랑합니다."

### 나쁜 예시 (사용 금지)
❌ "슬림해 보입니다"
❌ "다리가 길어 보이는 효과가 있습니다"
❌ "편하게 입을 수 있습니다"
❌ "여성스러운 분위기입니다"

---

## [후킹 카피]
- 10~20자, 임팩트 있게
- 예시:
  - "입는 순간 무드가 달라집니다"
  - "이 실루엣 하나로 코디 완성"
  - "데일리의 정석"

---

## [착장 문구 ({{outfitImageCount}}개 필수)]
- 한 문장, 사진 보조 역할
- 예시:
  - "내추럴하게 떨어지는 실루엣"
  - "소프트한 터치감"
  - "페미닌한 라인"
  - "이지한 데일리 무드"
  - "깔끔하게 정리되는 라인"
  - "가벼운 무게감"

---

## [디테일]
- 스펙 정보 위주
- 예시:
  - "material": "아크릴 혼방 니트, 소프트한 터치감"
  - "fit": "세미크롭 기장, 허리 라인 강조"

---

## [상품명 작성 규칙]
- 형식: [후킹키워드/후킹키워드] 아엔 여성 + 상품종류 + 특징 + 스타일
- 예시: [당일출고/무료배송] 아엔 여성 크롭 니트 퍼프소매 데일리 캐주얼룩`

export const DEFAULT_MALE_PROMPT = `나는 남성 패션 버티컬 커머스 "아엔 컬렉션"을 운영하고 있어.
타겟은 10대 후반~20대 중반 남성이고, 캐주얼/댄디 스타일이야.

아래 상품 사진을 보고 상세페이지 문구를 작성해줘.

---

## [상품 정보]
- 상품 종류: 사진을 보고 판단해줘
- 소재: 사진을 보고 판단해줘
- 특이사항: {{features}}
- 사이즈: {{size}}
- 컬러: {{colors}}

---

## [출력 형식 - 반드시 아래 JSON 형식으로만 출력해]

{
  "productName": "[후킹키워드/후킹키워드] 아엔 남성 + 상품종류 + 특징 + 스타일",
  "hookingCopy": "10~20자 한 줄 카피",
  "sizeColor": "사이즈 | 컬러1 · 컬러2 · 컬러3",
  "sellingPoints": [
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."},
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."},
    {"title": "키워드 (4글자 내외)", "desc": "2~3문장으로 구체적인 설명. ~합니다 체로 작성."}
  ],
  "outfitCopies": ["문구1", "문구2", ...], // {{outfitImageCount}}개 생성 (코디컷 이미지 개수만큼)
  "detail": {
    "material": "소재 정보",
    "fit": "핏 정보",
    "detail": "디테일 정보",
    "etc": "기타 정보"
  }
}

JSON 외에 다른 텍스트 출력하지 마.

---

## [톤 & 스타일 규칙]

### 전체 톤
- 차분하고 신뢰감 있게
- 브랜드가 고객에게 설명하는 느낌
- 고급스럽고 세련된 단어 선택

### 말투
- **~합니다, ~입니다** 체 사용
- "~해요", "~예요" 사용 금지

---

## [고급스러운 문장 작성 공식]

1. 명사에 "감(感)" 붙이기 → 고급스러움
   - 무게 → 무게감, 컬러 → 컬러감, 터치 → 터치감

2. 영어 차용어 적절히 사용 → 세련됨
   - 부드러운 → 소프트한, 자연스러운 → 내추럴한

3. "~을 자랑합니다" 마무리 → 브랜드 자신감
   - "~해 보입니다" 금지

4. 제품 특성 → 결론 순서로 작성
   - 효과 직접 언급 X ("슬림해 보입니다" 금지)

### 적용 예시
"가벼운 무게감과 소프트한 컬러감으로 높은 활용도를 자랑합니다."

---

## [셀링포인트 작성법]

### 구조
- 제품 특성 먼저 → 자연스럽게 결론
- 직접적인 효과 언급 X

### 좋은 예시
"title": "소프트 터치"
"desc": "고밀도 니트 원단의 소프트한 터치감을 자랑합니다. 가벼운 무게감으로 레이어드 시에도 부담 없는 실루엣을 연출합니다."

"title": "내추럴 핏"
"desc": "어깨선을 따라 내추럴하게 떨어지는 실루엣을 자랑합니다. 이지한 착용감으로 데일리 아이템으로 활용도가 높습니다."

"title": "무드 컬러"
"desc": "차분한 컬러감으로 어떤 하의와도 자연스러운 코디를 완성합니다. 단독 또는 이너로 다양한 스타일링이 가능합니다."

### 나쁜 예시 (사용 금지)
❌ "슬림해 보입니다"
❌ "다리가 길어 보이는 효과가 있습니다"
❌ "편하게 입을 수 있습니다"

---

## [후킹 카피]
- 10~20자, 임팩트 있게
- 예시:
  - "걸치는 순간 무드가 달라집니다"
  - "이 핏감 하나로 코디 완성"
  - "데일리의 정석"

---

## [착장 문구 ({{outfitImageCount}}개 필수)]
- 한 문장, 사진 보조 역할
- 예시:
  - "내추럴하게 떨어지는 실루엣"
  - "소프트한 터치감"
  - "이지한 데일리 무드"
  - "레이어드하기 좋은 핏감"
  - "깔끔하게 정리되는 라인"
  - "가벼운 무게감"

---

## [디테일]
- 스펙 정보 위주
- 예시:
  - "material": "아크릴 혼방 니트, 소프트한 터치감"
  - "fit": "내추럴 핏, 어깨선 따라 자연스럽게"

---

## [상품명 작성 규칙]
- 형식: [후킹키워드/후킹키워드] 아엔 남성 + 상품종류 + 특징 + 스타일
- 예시: [당일출고/무료배송] 아엔 남성 오버핏 니트 라운드넥 캐주얼 데일리룩`

// 로컬 스토리지 키
export const STORAGE_KEY_FEMALE = 'smartstore_prompt_female'
export const STORAGE_KEY_MALE = 'smartstore_prompt_male'

// 프롬프트에 변수 적용
export function applyVariables(
  prompt: string,
  variables: { features?: string; size?: string; colors?: string; outfitImageCount?: string }
): string {
  return prompt
    .replace(/\{\{features\}\}/g, variables.features || '없음')
    .replace(/\{\{size\}\}/g, variables.size || '미정')
    .replace(/\{\{colors\}\}/g, variables.colors || '미정')
    .replace(/\{\{outfitImageCount\}\}/g, variables.outfitImageCount || '6')
}

// 저장된 프롬프트 불러오기
export function getSavedPrompt(gender: 'male' | 'female'): string {
  if (typeof window === 'undefined') {
    return gender === 'female' ? DEFAULT_FEMALE_PROMPT : DEFAULT_MALE_PROMPT
  }

  const key = gender === 'female' ? STORAGE_KEY_FEMALE : STORAGE_KEY_MALE
  const defaultPrompt = gender === 'female' ? DEFAULT_FEMALE_PROMPT : DEFAULT_MALE_PROMPT

  const saved = localStorage.getItem(key)
  return saved || defaultPrompt
}

// 프롬프트 저장
export function savePrompt(gender: 'male' | 'female', prompt: string): void {
  if (typeof window === 'undefined') return

  const key = gender === 'female' ? STORAGE_KEY_FEMALE : STORAGE_KEY_MALE
  localStorage.setItem(key, prompt)
}

// 기본값으로 초기화
export function resetPrompt(gender: 'male' | 'female'): string {
  if (typeof window === 'undefined') {
    return gender === 'female' ? DEFAULT_FEMALE_PROMPT : DEFAULT_MALE_PROMPT
  }

  const key = gender === 'female' ? STORAGE_KEY_FEMALE : STORAGE_KEY_MALE
  const defaultPrompt = gender === 'female' ? DEFAULT_FEMALE_PROMPT : DEFAULT_MALE_PROMPT

  localStorage.removeItem(key)
  return defaultPrompt
}
