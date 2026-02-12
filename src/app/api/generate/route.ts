import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Next.js App Router용 설정 - 타임아웃 60초
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface RequestBody {
  images: {
    type: 'main' | 'outfit' | 'detail'
    data: string // base64
  }[]
  productInfo: {
    gender: 'male' | 'female'
    features: string
    size: string
    colors: string
  }
  customPrompt?: string // 사용자 지정 프롬프트 (옵션)
}

export async function POST(request: NextRequest) {
  try {
    // Request body 파싱
    let body: RequestBody
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Request body parse error:', parseError)
      return NextResponse.json(
        { error: '요청 데이터 파싱 실패. 이미지 크기가 너무 클 수 있습니다.' },
        { status: 400 }
      )
    }

    const { images, productInfo, customPrompt } = body

    if (!images || images.length === 0) {
      return NextResponse.json({ error: '이미지가 필요합니다' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // 프롬프트 생성 (커스텀 프롬프트가 있으면 사용, 없으면 기본 프롬프트 사용)
    const prompt = customPrompt || (productInfo.gender === 'female' ? getFemalePrompt(productInfo) : getMalePrompt(productInfo))

    // 이미지 파트 생성
    const imageParts = images.map((img) => {
      const base64Data = img.data.split(',')[1] || img.data
      return {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      }
    })

    // Gemini API 호출
    const result = await model.generateContent([prompt, ...imageParts])
    const response = result.response
    const text = response.text()

    // 응답 파싱
    const parsedResult = parseResponse(text)

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

function getFemalePrompt(info: RequestBody['productInfo']) {
  return `
나는 여성 패션 버티컬 커머스 "아엔 컬렉션"을 운영하고 있어.
타겟은 20~30대 여성이고, 러블리/캐주얼 스타일이야.

아래 상품 사진을 보고 상세페이지 문구를 작성해줘.

## [상품 정보]
- 상품 종류: 사진을 보고 판단해줘
- 소재: 사진을 보고 판단해줘
- 특이사항: ${info.features || '없음'}
- 사이즈: ${info.size || '미정'}
- 컬러: ${info.colors || '미정'}

## [출력 형식]

### ① 후킹 대표이미지 문구
- 한 줄 카피: 짧고 강렬하게, 10자~20자 이내 (28pt / 굵게)
- 예시 톤: "이거 입으면 분위기 달라짐.", "첫 만남에 이거면 끝."
- 사이즈 + 컬러 정보 한 줄 (14pt / 보통)

### ② 핵심 셀링포인트 3가지
- 각 포인트 제목: 상품의 핵심 장점 키워드 (20pt / 굵게)
- 각 포인트 설명: 그 장점이 왜 좋은지 한 줄 (14pt / 보통)
- 셀링포인트 우선순위: 체형 보정 → 분위기/무드 → 코디 활용도 순서로 작성
- 고객 입장에서 "이건 사야 해"라는 느낌이 들게

### ③ 착장 사진 사이 문구 6개
- 착장컷 사이사이에 들어갈 짧은 문구 (22pt / 굵게 / 가운데 정렬)
- 구매 욕구 자극: "이거 뭐냐", "핏 ㄹㅇ", "그냥 사세요", "이 가격에 이 퀄?", "개편함", "코디 끝"
- 직접 입어본 것처럼 생생하게, 담백하게
- "미쳤음" 한두 번만 쓰기, "갓성비", "JMT" 사용 금지

## [톤앤매너]
- "친한 언니가 찐으로 추천해주는 느낌"
- 친근하면서도 신뢰감 있게
- 말투: 짧고 강렬하게, 형용사 과하게 X
- 이모지 사용 X

## [MZ 키워드 참고]
- "이거 뭐야", "핏 실화?", "이거 못 참지", "데일리로 딱"
- "N가지 무드 가능", "은근 분위기 있음", "이거 하나면 끝"

## [체형 어필 표현] (적극 사용)
- "어깨 좁아 보임", "허리 잘록하게", "다리 길어 보이는 기장"
- "팔뚝 커버 완벽", "골반 커버됨", "상체 화사해 보임"

## [피해야 할 표현]
- "러블리한", "사랑스러운", "여성스러운" → 너무 뻔함
- "존예", "갓성비" → 올드한 표현

## [출력 형식 - 반드시 아래 JSON 형식으로만 출력해]

{
  "productName": "[후킹키워드1/후킹키워드2] 아엔 + 상품종류 + 특징",
  "hookingCopy": "10~20자 한 줄 카피 (28pt)",
  "sizeColor": "사이즈 | 컬러1 · 컬러2 (14pt)",
  "sellingPoints": [
    {"title": "키워드1", "desc": "설명1"},
    {"title": "키워드2", "desc": "설명2"},
    {"title": "키워드3", "desc": "설명3"}
  ],
  "outfitCopies": ["문구1", "문구2", "문구3", "문구4", "문구5", "문구6"],
  "detail": {
    "material": "소재 정보",
    "fit": "핏 정보",
    "detail": "디테일 정보",
    "etc": "기타"
  }
}

JSON 외에 다른 텍스트 출력하지 마.
`
}

function getMalePrompt(info: RequestBody['productInfo']) {
  return `
나는 남성 패션 쇼핑몰을 운영하고 있어.
타겟은 20~30대 남성이고, 캐주얼/미니멀 스타일이야.

아래 상품 사진을 보고 상세페이지 문구를 작성해줘.

## [상품 정보]
- 상품 종류: 사진을 보고 판단해줘
- 소재: 사진을 보고 판단해줘
- 특이사항: ${info.features || '없음'}
- 사이즈: ${info.size || '미정'}
- 컬러: ${info.colors || '미정'}

## [출력 형식]

### ① 후킹 대표이미지 문구
- 한 줄 카피: 짧고 강렬하게, 10자~20자 이내 (28pt / 굵게)
- 예시 톤: "이거 입으면 분위기 달라짐.", "데일리로 이거면 끝."
- 사이즈 + 컬러 정보 한 줄 (14pt / 보통)

### ② 핵심 셀링포인트 3가지
- 각 포인트 제목: 상품의 핵심 장점 키워드 (20pt / 굵게)
- 각 포인트 설명: 그 장점이 왜 좋은지 한 줄 (14pt / 보통)
- 셀링포인트 우선순위: 핏/실루엣 → 소재감 → 코디 활용도 순서로 작성
- 고객 입장에서 "이건 사야 해"라는 느낌이 들게

### ③ 착장 사진 사이 문구 6개
- 착장컷 사이사이에 들어갈 짧은 문구 (22pt / 굵게 / 가운데 정렬)
- 구매 욕구 자극: "이거 뭐냐", "핏 ㄹㅇ", "그냥 사세요", "이 가격에 이 퀄?", "개편함", "코디 끝"
- 직접 입어본 것처럼 생생하게, 담백하게
- "미쳤음" 한두 번만 쓰기, "갓성비", "JMT" 사용 금지

## [톤앤매너]
- 담백하고 쿨한 느낌
- 과장 없이 핵심만
- 말투: 짧고 강렬하게
- 이모지 사용 X

## [MZ 키워드 참고]
- "이거 뭐냐", "핏 실화?", "그냥 사세요", "데일리로 딱"
- "은근 분위기 있음", "이거 하나면 끝"

## [피해야 할 표현]
- "멋진", "세련된" → 너무 뻔함
- "존예", "갓성비" → 올드한 표현

## [출력 형식 - 반드시 아래 JSON 형식으로만 출력해]

{
  "productName": "[후킹키워드1/후킹키워드2] 상품종류 + 특징",
  "hookingCopy": "10~20자 한 줄 카피 (28pt)",
  "sizeColor": "사이즈 | 컬러1 · 컬러2 (14pt)",
  "sellingPoints": [
    {"title": "키워드1", "desc": "설명1"},
    {"title": "키워드2", "desc": "설명2"},
    {"title": "키워드3", "desc": "설명3"}
  ],
  "outfitCopies": ["문구1", "문구2", "문구3", "문구4", "문구5", "문구6"],
  "detail": {
    "material": "소재 정보",
    "fit": "핏 정보",
    "detail": "디테일 정보",
    "etc": "기타"
  }
}

JSON 외에 다른 텍스트 출력하지 마.
`
}

function parseResponse(text: string) {
  try {
    // JSON 부분 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('JSON 파싱 실패')
  } catch {
    // 파싱 실패 시 기본값 반환
    return {
      productName: '상품명을 확인해주세요',
      hookingCopy: '생성된 문구를 확인해주세요',
      sizeColor: '',
      sellingPoints: [
        { title: '포인트 1', desc: '설명' },
        { title: '포인트 2', desc: '설명' },
        { title: '포인트 3', desc: '설명' },
      ],
      outfitCopies: ['문구 1', '문구 2', '문구 3', '문구 4', '문구 5', '문구 6'],
      detail: {
        material: '-',
        fit: '-',
        detail: '-',
        etc: '-',
      },
    }
  }
}
