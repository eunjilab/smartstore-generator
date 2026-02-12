'use client'

interface Props {
  success: boolean
  productId?: string
  productName?: string
  error?: string
  onNewProduct: () => void
  onRetry: () => void
}

export default function RegistrationComplete({
  success,
  productId,
  productName,
  error,
  onNewProduct,
  onRetry,
}: Props) {
  // 스마트스토어 상품 페이지 URL
  const productUrl = productId
    ? `https://smartstore.naver.com/YourStoreName/products/${productId}`
    : undefined

  // 스마트스토어 판매자센터 URL
  const sellerCenterUrl = productId
    ? `https://sell.smartstore.naver.com/#/products/${productId}`
    : 'https://sell.smartstore.naver.com/#/products'

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">등록 완료!</h2>
        <p className="text-gray-600 mb-6">
          상품이 스마트스토어에 성공적으로 등록되었습니다.
        </p>

        {/* 상품 정보 */}
        {(productId || productName) && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-2">
              {productName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">상품명</span>
                  <span className="font-medium text-gray-800">{productName}</span>
                </div>
              )}
              {productId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 ID</span>
                  <span className="font-mono text-gray-800">{productId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 링크 버튼들 */}
        <div className="space-y-3 mb-6">
          <a
            href={sellerCenterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all"
          >
            판매자센터에서 확인하기
          </a>

          {productUrl && (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 border-2 border-green-600 text-green-600 font-medium rounded-xl hover:bg-green-50 transition-all"
            >
              상품 페이지 보기
            </a>
          )}
        </div>

        {/* 새 상품 등록 */}
        <button
          onClick={onNewProduct}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 상품 등록하기
        </button>

        {/* 안내 메시지 */}
        <p className="text-xs text-gray-400 mt-4">
          상품 정보는 스마트스토어 판매자센터에서 수정할 수 있습니다.
        </p>
      </div>
    )
  }

  // 실패 화면
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      {/* 실패 아이콘 */}
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">등록 실패</h2>
      <p className="text-gray-600 mb-4">
        상품 등록 중 오류가 발생했습니다.
      </p>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-700">오류 내용</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 해결 방법 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
        <p className="font-medium text-yellow-800 mb-2">해결 방법</p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 네트워크 연결 상태를 확인해주세요</li>
          <li>• API 인증 정보가 올바른지 확인해주세요</li>
          <li>• 필수 항목이 모두 입력되었는지 확인해주세요</li>
          <li>• 잠시 후 다시 시도해주세요</li>
        </ul>
      </div>

      {/* 버튼들 */}
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          다시 시도하기
        </button>

        <button
          onClick={onNewProduct}
          className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
        >
          처음부터 다시 시작
        </button>
      </div>
    </div>
  )
}
