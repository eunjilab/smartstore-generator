// 네이버 커머스 API 유틸리티
import bcrypt from 'bcryptjs'

const COMMERCE_API_URL = 'https://api.commerce.naver.com'

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface TokenCache {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

/**
 * BCRYPT 타임스탬프 기반 서명 생성
 * 네이버 커머스 API는 bcrypt 해시 + base64 인코딩을 요구합니다
 */
function generateSignature(clientId: string, clientSecret: string, timestamp: number): string {
  // 밑줄로 연결: clientId_timestamp
  const password = `${clientId}_${timestamp}`

  // clientSecret이 유효한 bcrypt salt인지 확인하고 보완
  let salt = clientSecret
  if (salt.startsWith('$2a$') || salt.startsWith('$2b$')) {
    // salt 길이가 부족하면 패딩 추가 (29자가 표준)
    while (salt.length < 29) {
      salt += '.'
    }
  }

  // bcrypt 해시 생성 (clientSecret을 salt로 사용)
  const hashed = bcrypt.hashSync(password, salt)

  // base64 인코딩 (네이버 API 요구사항)
  const base64Encoded = Buffer.from(hashed).toString('base64')
  return base64Encoded
}

/**
 * OAuth 토큰 발급
 */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.NAVER_COMMERCE_APP_ID
  const clientSecret = process.env.NAVER_COMMERCE_APP_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('네이버 커머스 API 인증 정보가 설정되지 않았습니다')
  }

  // 캐시된 토큰이 유효하면 반환
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  const timestamp = Date.now()
  const signature = generateSignature(clientId, clientSecret, timestamp)

  const response = await fetch(`${COMMERCE_API_URL}/external/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      timestamp: timestamp.toString(),
      client_secret_sign: signature,
      grant_type: 'client_credentials',
      type: 'SELF',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('토큰 발급 실패 상세:', { status: response.status, error })
    throw new Error(`토큰 발급 실패 (${response.status}): ${error}`)
  }

  const data: TokenResponse = await response.json()

  // 토큰 캐시 (만료 1분 전까지)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

/**
 * 이미지 업로드 (네이버 커머스 서버)
 */
export async function uploadImage(
  imageBase64: string,
  imageType: 'REPRESENTATIVE' | 'DETAIL'
): Promise<string> {
  const token = await getAccessToken()

  // Base64에서 실제 데이터 추출
  const base64Data = imageBase64.split(',')[1] || imageBase64
  const buffer = Buffer.from(base64Data, 'base64')

  // FormData 생성
  const formData = new FormData()
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  formData.append('imageFiles', blob, `image_${Date.now()}.jpg`)

  const response = await fetch(
    `${COMMERCE_API_URL}/external/v1/product-images/upload?imageType=${imageType}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('이미지 업로드 실패 상세:', { status: response.status, error, imageType })
    throw new Error(`이미지 업로드 실패 (${response.status}): ${error}`)
  }

  const data = await response.json()
  return data.images?.[0]?.url || ''
}

/**
 * 카테고리 조회
 */
export async function getCategories(keyword?: string): Promise<CategoryInfo[]> {
  const token = await getAccessToken()

  const url = keyword
    ? `${COMMERCE_API_URL}/external/v1/categories?keyword=${encodeURIComponent(keyword)}`
    : `${COMMERCE_API_URL}/external/v1/categories`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`카테고리 조회 실패: ${error}`)
  }

  const data = await response.json()
  return data.contents || []
}

export interface CategoryInfo {
  id: string
  name: string
  wholeCategoryName: string
  lastChildYn: boolean
}

export interface ProductOption {
  optionName1: string  // 예: "사이즈"
  optionValue1: string  // 예: "S, M, L, XL"
  optionName2?: string  // 예: "색상"
  optionValue2?: string  // 예: "블랙, 화이트"
}

/**
 * 옵션 조합 생성 (사이즈 x 색상)
 */
function generateOptionCombinations(options: ProductOption, totalStock: number) {
  const sizes = options.optionValue1.split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
  const colors = options.optionValue2?.split(/[,\s]+/).map(s => s.trim()).filter(Boolean) || []

  const combinations: any[] = []
  const stockPerOption = Math.floor(totalStock / (sizes.length * Math.max(colors.length, 1)))

  if (colors.length > 0) {
    // 사이즈 x 색상 조합
    for (const size of sizes) {
      for (const color of colors) {
        combinations.push({
          stockQuantity: stockPerOption || 10,
          price: 0,
          usable: true,
          optionName1: size,
          optionName2: color,
        })
      }
    }
  } else {
    // 사이즈만
    for (const size of sizes) {
      combinations.push({
        stockQuantity: stockPerOption || 10,
        price: 0,
        usable: true,
        optionName1: size,
      })
    }
  }

  return combinations
}

export interface ProductRegistration {
  // 기본 정보
  name: string
  salePrice: number
  stockQuantity: number
  categoryId: string

  // 상세 설명
  detailContent: string  // HTML

  // 이미지
  representativeImage: string  // URL
  optionalImages?: string[]  // URLs

  // 옵션
  options?: ProductOption

  // 배송
  deliveryFee: number
  deliveryFeeType: 'FREE' | 'PAID' | 'CONDITIONAL_FREE'
  conditionalFreeAmount?: number  // 조건부 무료 금액

  // 추가 정보
  productInfoProvidedNotice?: Record<string, string>
}

/**
 * 상품 등록
 */
export async function registerProduct(product: ProductRegistration): Promise<{ productId: string }> {
  const token = await getAccessToken()

  // 네이버 커머스 API 형식으로 변환
  const requestBody = {
    originProduct: {
      statusType: 'SALE',
      saleType: 'NEW',
      leafCategoryId: product.categoryId,
      name: product.name,
      detailContent: product.detailContent,
      images: {
        representativeImage: {
          url: product.representativeImage,
        },
        optionalImages: product.optionalImages?.map(url => ({ url })) || [],
      },
      saleStartDate: new Date().toISOString(),
      saleEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후
      salePrice: product.salePrice,
      stockQuantity: product.stockQuantity,
      deliveryInfo: {
        deliveryType: 'DELIVERY',
        deliveryAttributeType: 'NORMAL',
        deliveryCompany: 'CJGLS', // CJ대한통운 (필수)
        deliveryFee: {
          deliveryFeeType: product.deliveryFeeType,
          baseFee: product.deliveryFee,
          ...(product.deliveryFeeType === 'CONDITIONAL_FREE' && {
            conditionalFree: {
              baseConditionAmount: product.conditionalFreeAmount || 50000,
            },
          }),
        },
        claimDeliveryInfo: {
          returnDeliveryFee: 3000,
          exchangeDeliveryFee: 6000,
        },
      },
      detailAttribute: {
        naverShoppingSearchInfo: {
          manufacturerMadeYn: false,
        },
        afterServiceInfo: {
          afterServiceTelephoneNumber: '010-0000-0000',
          afterServiceGuideContent: '고객센터로 문의해주세요',
        },
        purchaseQuantityInfo: {
          minPurchaseQuantity: 1,
          maxPurchaseQuantityPerId: 0,
          maxPurchaseQuantityPerOrder: 0,
        },
        originAreaInfo: {
          originAreaCode: '03',
          content: '상세페이지 참조',
        },
        sellerCodeInfo: {},
        // 조합형 옵션 (사이즈 x 색상)
        optionInfo: product.options ? {
          optionCombinationSortType: 'CREATE',
          optionCombinationGroupNames: {
            optionGroupName1: product.options.optionName1 || '사이즈',
            ...(product.options.optionName2 && { optionGroupName2: product.options.optionName2 }),
          },
          optionCombinations: generateOptionCombinations(product.options, product.stockQuantity),
        } : undefined,
        certificationTargetExcludeContent: {
          childCertifiedProductExclusionYn: true,
          kcExemptionType: 'OVERSEAS',
          kcCertifiedProductExclusionYn: 'TRUE',
        },
        minorPurchasable: true,
      },
    },
    smartstoreChannelProduct: {
      naverShoppingRegistration: true,
      channelProductDisplayStatusType: 'ON',
    },
  }

  const response = await fetch(`${COMMERCE_API_URL}/external/v2/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`상품 등록 실패: ${error}`)
  }

  const data = await response.json()
  return { productId: data.originProduct?.id || data.id }
}

/**
 * 패션 카테고리 추천 (AI 분석 결과 기반)
 */
export function suggestCategory(productType: string, gender: 'male' | 'female'): string[] {
  const categoryMap: Record<string, Record<string, string[]>> = {
    female: {
      '원피스': ['50000804', '50000805', '50000806'],
      '블라우스': ['50000167', '50000168'],
      '니트': ['50000160', '50000161'],
      '티셔츠': ['50000158', '50000159'],
      '팬츠': ['50000171', '50000172'],
      '스커트': ['50000169', '50000170'],
      '자켓': ['50000163', '50000164'],
      '코트': ['50000165', '50000166'],
      '가디건': ['50000162'],
    },
    male: {
      '티셔츠': ['50000201', '50000202'],
      '셔츠': ['50000203', '50000204'],
      '니트': ['50000205', '50000206'],
      '팬츠': ['50000207', '50000208'],
      '자켓': ['50000209', '50000210'],
      '코트': ['50000211', '50000212'],
    },
  }

  const genderCategories = categoryMap[gender] || categoryMap.female

  for (const [key, ids] of Object.entries(genderCategories)) {
    if (productType.includes(key)) {
      return ids
    }
  }

  // 기본 카테고리
  return gender === 'female' ? ['50000158'] : ['50000201']
}
