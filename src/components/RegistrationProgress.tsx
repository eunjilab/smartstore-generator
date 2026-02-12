'use client'

export type RegistrationStep =
  | 'preparing'
  | 'uploading_images'
  | 'generating_html'
  | 'registering_product'
  | 'completed'
  | 'failed'

interface Props {
  currentStep: RegistrationStep
  progress: number  // 0-100
  error?: string
}

const STEPS = [
  { key: 'preparing', label: '등록 준비', icon: '1' },
  { key: 'uploading_images', label: '이미지 업로드', icon: '2' },
  { key: 'generating_html', label: 'HTML 생성', icon: '3' },
  { key: 'registering_product', label: '상품 등록', icon: '4' },
  { key: 'completed', label: '완료', icon: '✓' },
]

export default function RegistrationProgress({ currentStep, progress, error }: Props) {
  const getCurrentStepIndex = () => {
    return STEPS.findIndex((s) => s.key === currentStep)
  }

  const getStepStatus = (stepKey: string) => {
    const currentIndex = getCurrentStepIndex()
    const stepIndex = STEPS.findIndex((s) => s.key === stepKey)

    if (currentStep === 'failed') {
      if (stepIndex < currentIndex) return 'completed'
      if (stepIndex === currentIndex) return 'failed'
      return 'pending'
    }

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'preparing':
        return '등록 준비 중입니다...'
      case 'uploading_images':
        return '이미지를 네이버 서버에 업로드하고 있습니다...'
      case 'generating_html':
        return '상세페이지 HTML을 생성하고 있습니다...'
      case 'registering_product':
        return '스마트스토어에 상품을 등록하고 있습니다...'
      case 'completed':
        return '상품 등록이 완료되었습니다!'
      case 'failed':
        return error || '등록 중 오류가 발생했습니다'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
        {currentStep === 'completed' ? '등록 완료!' : currentStep === 'failed' ? '등록 실패' : '상품 등록 중...'}
      </h2>

      {/* 프로그레스 바 */}
      <div className="mb-8">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              currentStep === 'failed'
                ? 'bg-red-500'
                : currentStep === 'completed'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{getStepMessage()}</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="flex justify-between items-center">
        {STEPS.map((step, idx) => {
          const status = getStepStatus(step.key)
          return (
            <div key={step.key} className="flex flex-col items-center relative">
              {/* 연결선 */}
              {idx > 0 && (
                <div
                  className={`absolute right-1/2 top-5 w-full h-0.5 -translate-y-1/2 ${
                    status === 'pending' ? 'bg-gray-200' : 'bg-green-500'
                  }`}
                  style={{ width: 'calc(100% + 2rem)', right: '50%' }}
                />
              )}

              {/* 아이콘 */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  status === 'completed'
                    ? 'bg-green-500 text-white'
                    : status === 'active'
                    ? 'bg-purple-500 text-white animate-pulse'
                    : status === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : status === 'failed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : status === 'active' ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>

              {/* 라벨 */}
              <span
                className={`mt-2 text-xs text-center ${
                  status === 'active' ? 'text-purple-600 font-medium' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'failed' ? 'text-red-600' :
                  'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 에러 메시지 */}
      {currentStep === 'failed' && error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">오류가 발생했습니다</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
