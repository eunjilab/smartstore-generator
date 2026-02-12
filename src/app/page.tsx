'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ProductForm from '@/components/ProductForm'
import ResultDisplay from '@/components/ResultDisplay'
import HTMLPreview from '@/components/HTMLPreview'
import SalesInfoForm, { SalesInfo } from '@/components/SalesInfoForm'
import RegistrationSummary from '@/components/RegistrationSummary'
import RegistrationProgress, { RegistrationStep } from '@/components/RegistrationProgress'
import RegistrationComplete from '@/components/RegistrationComplete'
import PromptManager from '@/components/PromptManager'
import { processImages, compressImageForAPI, cropToSquare, cropTo3x4 } from '@/utils/imageUtils'
import { generateDetailPageHTML } from '@/utils/htmlTemplate'
import { getSavedPrompt, applyVariables } from '@/constants/prompts'

export interface CropData {
  scale: number
  x: number
  y: number
}

export interface ImageItem {
  id: string
  file: File
  preview: string
  type: 'main' | 'outfit' | 'detail' | 'sizeChart'
  editedPreview?: string // 편집된 이미지 URL
  cropData?: CropData // 크롭 데이터
}

// 컬러별 코디컷 데이터
export interface ColorOutfit {
  id: string
  colorName: string
  isMain: boolean
  images: ImageItem[]
}

// 새로운 이미지 데이터 구조
export interface ImageData {
  mainImage: ImageItem | null
  sizeChartImage: ImageItem | null
  colorOutfits: ColorOutfit[]
}

export interface ProductInfo {
  gender: 'male' | 'female'
  features: string
  size: string
  colors: string
}

export interface GeneratedResult {
  productName: string
  hookingCopy: string
  sizeColor: string
  sellingPoints: {
    title: string
    desc: string
  }[]
  outfitCopies: string[]
  detail: {
    material: string
    fit: string
    detail: string
    etc: string
  }
}

interface ProcessedImage {
  type: string
  data: string
  processed: string
}

type AppStep = 'input' | 'result' | 'confirm' | 'registering' | 'complete'

export default function Home() {
  // 앱 단계 상태
  const [appStep, setAppStep] = useState<AppStep>('input')

  // 기존 이미지 상태 (호환성 유지)
  const [images, setImages] = useState<ImageItem[]>([])

  // 새로운 이미지 데이터 구조
  const [imageData, setImageData] = useState<ImageData>({
    mainImage: null,
    sizeChartImage: null,
    colorOutfits: []
  })
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    gender: 'female',
    features: '',
    size: '',
    colors: '',
  })
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // HTML 생성 관련 상태
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [generatedHTML, setGeneratedHTML] = useState<string>('')
  const [showHTMLPreview, setShowHTMLPreview] = useState(false)
  const [isProcessingHTML, setIsProcessingHTML] = useState(false)

  // 네이버 등록 관련 상태
  const [salesInfo, setSalesInfo] = useState<SalesInfo>({
    productName: '',
    salePrice: 0,
    stockQuantity: 100,
    deliveryFeeType: 'CONDITIONAL_FREE',
    deliveryFee: 3000,
    conditionalFreeAmount: 50000,
    categoryId: '',
    categoryName: '',
    sizes: [],
    colors: [],
  })

  // 등록 진행 상태
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('preparing')
  const [registrationProgress, setRegistrationProgress] = useState(0)
  const [registrationError, setRegistrationError] = useState<string>('')
  const [registeredProductId, setRegisteredProductId] = useState<string>('')

  // 프롬프트 관리 모달 상태
  const [showPromptManager, setShowPromptManager] = useState(false)

  const handleGenerate = async () => {
    // 최소한 메인 이미지와 컬러 코디컷이 있어야 함
    const mainColor = imageData.colorOutfits.find(c => c.isMain)
    if (!imageData.mainImage) {
      setError('메인 대표사진을 업로드해주세요')
      return
    }
    if (!mainColor || mainColor.images.length === 0) {
      setError('대표 컬러의 코디컷 이미지를 업로드해주세요')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 이미지를 base64로 변환 후 압축 (Vercel 4.5MB 제한 대응)
      const allImages: { type: string; data: string }[] = []

      // 메인 이미지
      if (imageData.mainImage) {
        const base64 = imageData.mainImage.editedPreview || await fileToBase64(imageData.mainImage.file)
        const compressed = await compressImageForAPI(base64, 800, 0.7)
        allImages.push({ type: 'main', data: compressed })
      }

      // 대표 컬러의 코디컷 이미지들
      for (const img of mainColor.images) {
        const base64 = img.editedPreview || await fileToBase64(img.file)
        const compressed = await compressImageForAPI(base64, 800, 0.7)
        allImages.push({ type: 'outfit', data: compressed })
      }

      // 대표 컬러 코디컷 개수
      const outfitImageCount = mainColor.images.length

      // 모든 컬러 목록 (컬러명 추출)
      const colorNames = imageData.colorOutfits
        .filter(c => c.colorName)
        .map(c => c.colorName)
        .join(', ')

      // 저장된 프롬프트 가져오기
      const savedPrompt = getSavedPrompt(productInfo.gender)
      const prompt = applyVariables(savedPrompt, {
        features: productInfo.features,
        size: productInfo.size,
        colors: colorNames || productInfo.colors,
        outfitImageCount: outfitImageCount.toString(),
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: allImages,
          productInfo: {
            ...productInfo,
            colors: colorNames || productInfo.colors,
          },
          customPrompt: prompt,
          outfitImageCount,
        }),
      })

      // 응답 텍스트를 먼저 가져옴
      const responseText = await response.text()

      if (!response.ok) {
        // JSON 파싱 시도
        try {
          const errorData = JSON.parse(responseText)
          throw new Error(errorData.error || '생성 실패')
        } catch {
          // JSON이 아니면 텍스트 그대로 에러 메시지로 사용
          throw new Error(responseText || '생성 실패')
        }
      }

      // 성공 응답 JSON 파싱
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error('API 응답 파싱 실패: ' + responseText.substring(0, 100))
      }
      setResult(data)

      // 이미지 처리 - 새 구조에 맞게 처리
      const processedData: ProcessedImage[] = []

      // 메인 이미지
      if (imageData.mainImage) {
        const base64 = imageData.mainImage.editedPreview || await fileToBase64(imageData.mainImage.file)
        const cropped = imageData.mainImage.editedPreview ? base64 : await cropToSquare(base64)
        processedData.push({ type: 'main', data: base64, processed: cropped })
      }

      // 사이즈표 이미지
      if (imageData.sizeChartImage) {
        const base64 = imageData.sizeChartImage.editedPreview || await fileToBase64(imageData.sizeChartImage.file)
        processedData.push({ type: 'sizeChart', data: base64, processed: base64 })
      }

      // 대표 컬러 코디컷 이미지들
      for (const img of mainColor.images) {
        const base64 = img.editedPreview || await fileToBase64(img.file)
        const cropped = img.editedPreview ? base64 : await cropTo3x4(base64)
        processedData.push({ type: 'outfit', data: base64, processed: cropped })
      }

      setProcessedImages(processedData)

      // 결과 화면으로 이동
      setAppStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateHTML = async () => {
    if (!result || processedImages.length === 0) {
      setError('먼저 문구를 생성해주세요')
      return
    }

    setIsProcessingHTML(true)

    try {
      // 컬러 정보 추출
      const colors = imageData.colorOutfits
        .filter(c => c.colorName)
        .map(c => ({ name: c.colorName, isMain: c.isMain }))

      const html = generateDetailPageHTML(processedImages, result, colors)
      setGeneratedHTML(html)
      setShowHTMLPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'HTML 생성 중 오류가 발생했습니다')
    } finally {
      setIsProcessingHTML(false)
    }
  }

  const handleShowConfirm = () => {
    // 필수 필드 검증
    if (!salesInfo.productName) {
      setError('상품명을 입력해주세요')
      return
    }
    if (!salesInfo.salePrice) {
      setError('판매가를 입력해주세요')
      return
    }
    if (!salesInfo.categoryId) {
      setError('카테고리를 선택해주세요')
      return
    }

    setError(null)
    setAppStep('confirm')
  }

  const handleStartRegistration = async () => {
    setAppStep('registering')
    setRegistrationStep('preparing')
    setRegistrationProgress(5)
    setRegistrationError('')

    try {
      // Step 1: 준비
      await delay(500)
      setRegistrationProgress(10)

      // Step 2: 이미지 업로드
      setRegistrationStep('uploading_images')
      setRegistrationProgress(20)

      const uploadImages = [
        { data: processedImages[0]?.processed || processedImages[0]?.data, type: 'REPRESENTATIVE' as const },
        ...processedImages.slice(1).map((img) => ({
          data: img.processed || img.data,
          type: 'DETAIL' as const,
        })),
      ]

      const uploadResponse = await fetch('/api/naver/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadImages }),
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || '이미지 업로드 실패')
      }

      const uploadResult = await uploadResponse.json()
      const uploadedImages = uploadResult.uploadedImages.filter((img: { success: boolean }) => img.success)
      const failedImages = uploadResult.uploadedImages.filter((img: { success: boolean }) => !img.success)

      if (uploadedImages.length === 0) {
        const errorDetails = failedImages.map((img: { error?: string }) => img.error).join(', ')
        throw new Error(`이미지 업로드에 실패했습니다: ${errorDetails}`)
      }

      setRegistrationProgress(50)

      // Step 3: HTML 생성
      setRegistrationStep('generating_html')
      setRegistrationProgress(60)

      let html = generatedHTML
      if (!html) {
        html = generateDetailPageHTML(processedImages, result!)
        setGeneratedHTML(html)
      }

      await delay(500)
      setRegistrationProgress(70)

      // Step 4: 상품 등록
      setRegistrationStep('registering_product')
      setRegistrationProgress(80)

      const representativeImage = uploadedImages.find((img: { type: string }) => img.type === 'REPRESENTATIVE')?.url
      const optionalImages = uploadedImages
        .filter((img: { type: string }) => img.type === 'DETAIL')
        .map((img: { url: string }) => img.url)

      const productData = {
        name: salesInfo.productName,
        salePrice: salesInfo.salePrice,
        stockQuantity: salesInfo.stockQuantity,
        categoryId: salesInfo.categoryId,
        detailContent: html,
        representativeImage,
        optionalImages,
        deliveryFeeType: salesInfo.deliveryFeeType,
        deliveryFee: salesInfo.deliveryFee,
        conditionalFreeAmount: salesInfo.conditionalFreeAmount,
        options: salesInfo.sizes.length > 0 || salesInfo.colors.length > 0
          ? {
              optionName1: salesInfo.sizes.length > 0 ? '사이즈' : '색상',
              optionValue1: salesInfo.sizes.length > 0 ? salesInfo.sizes.join(',') : salesInfo.colors.join(','),
              ...(salesInfo.sizes.length > 0 && salesInfo.colors.length > 0
                ? {
                    optionName2: '색상',
                    optionValue2: salesInfo.colors.join(','),
                  }
                : {}),
            }
          : undefined,
      }

      const registerResponse = await fetch('/api/naver/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productData }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        throw new Error(errorData.error || '상품 등록 실패')
      }

      const registerResult = await registerResponse.json()
      setRegisteredProductId(registerResult.productId)

      setRegistrationProgress(100)
      setRegistrationStep('completed')

      // 완료 화면으로 이동
      await delay(1000)
      setAppStep('complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '등록 중 오류가 발생했습니다'
      setRegistrationError(errorMessage)
      setRegistrationStep('failed')
    }
  }

  const handleNewProduct = () => {
    // 모든 상태 초기화
    setImages([])
    setImageData({
      mainImage: null,
      sizeChartImage: null,
      colorOutfits: []
    })
    setProductInfo({
      gender: 'female',
      features: '',
      size: '',
      colors: '',
    })
    setResult(null)
    setProcessedImages([])
    setGeneratedHTML('')
    setSalesInfo({
      productName: '',
      salePrice: 0,
      stockQuantity: 100,
      deliveryFeeType: 'CONDITIONAL_FREE',
      deliveryFee: 3000,
      conditionalFreeAmount: 50000,
      categoryId: '',
      categoryName: '',
      sizes: [],
      colors: [],
    })
    setRegistrationStep('preparing')
    setRegistrationProgress(0)
    setRegistrationError('')
    setRegisteredProductId('')
    setError(null)
    setAppStep('input')
  }

  const handleRetry = () => {
    setAppStep('confirm')
    setRegistrationStep('preparing')
    setRegistrationProgress(0)
    setRegistrationError('')
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // 공통 헤더 컴포넌트
  const Header = () => (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        상세페이지 문구 생성기
      </h1>
      <button
        onClick={() => setShowPromptManager(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        프롬프트 관리
      </button>
    </header>
  )

  // 등록 중 또는 완료 화면
  if (appStep === 'registering') {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <Header />
        <RegistrationProgress
          currentStep={registrationStep}
          progress={registrationProgress}
          error={registrationError}
        />
        {registrationStep === 'failed' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => setAppStep('result')}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
            >
              돌아가기
            </button>
          </div>
        )}
        {showPromptManager && (
          <PromptManager onClose={() => setShowPromptManager(false)} />
        )}
      </main>
    )
  }

  if (appStep === 'complete') {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <Header />
        <RegistrationComplete
          success={!registrationError}
          productId={registeredProductId}
          productName={salesInfo.productName}
          error={registrationError}
          onNewProduct={handleNewProduct}
          onRetry={handleRetry}
        />
        {showPromptManager && (
          <PromptManager onClose={() => setShowPromptManager(false)} />
        )}
      </main>
    )
  }

  // 최종 확인 화면
  if (appStep === 'confirm') {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <Header />
        <RegistrationSummary
          images={processedImages}
          result={result!}
          salesInfo={salesInfo}
          onConfirm={handleStartRegistration}
          onEdit={() => setAppStep('result')}
        />
        {showPromptManager && (
          <PromptManager onClose={() => setShowPromptManager(false)} />
        )}
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Header />

      <div className="space-y-6">
        {/* 이미지 업로드 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">1. 이미지 업로드</h2>
          <ImageUploader imageData={imageData} setImageData={setImageData} />
        </section>

        {/* 상품 정보 입력 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">2. 상품 정보</h2>
          <ProductForm productInfo={productInfo} setProductInfo={setProductInfo} />
        </section>

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !imageData.mainImage || !imageData.colorOutfits.some(c => c.isMain && c.images.length > 0)}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              생성 중...
            </span>
          ) : (
            '상세페이지 문구 생성'
          )}
        </button>

        {/* 에러 표시 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* 결과 표시 */}
        {result && appStep === 'result' && (
          <>
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">3. 생성 결과</h2>
              <ResultDisplay result={result} />

              {/* HTML 생성 버튼 */}
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleGenerateHTML}
                  disabled={isProcessingHTML}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingHTML ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      HTML 생성 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      상세페이지 HTML 미리보기
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* 네이버 스마트스토어 등록 */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">N</span>
                4. 스마트스토어 등록 정보
              </h2>

              <SalesInfoForm
                salesInfo={salesInfo}
                setSalesInfo={setSalesInfo}
                suggestedProductName={result.productName || result.hookingCopy}
                inputSize={productInfo.size}
                inputColors={productInfo.colors}
              />

              {/* 등록 확인 버튼 */}
              <button
                onClick={handleShowConfirm}
                disabled={!salesInfo.productName || !salesInfo.salePrice || !salesInfo.categoryId}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                등록 정보 확인하기
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                다음 단계에서 모든 정보를 확인 후 등록합니다
              </p>
            </section>
          </>
        )}
      </div>

      {/* HTML 미리보기 모달 */}
      {showHTMLPreview && generatedHTML && (
        <HTMLPreview
          html={generatedHTML}
          onClose={() => setShowHTMLPreview(false)}
        />
      )}

      {/* 프롬프트 관리 모달 */}
      {showPromptManager && (
        <PromptManager onClose={() => setShowPromptManager(false)} />
      )}
    </main>
  )
}
