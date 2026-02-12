'use client'

import { SalesInfo } from './SalesInfoForm'
import { GeneratedResult } from '@/app/page'

interface ProcessedImage {
  type: string
  data: string
  processed: string
}

interface Props {
  images: ProcessedImage[]
  result: GeneratedResult
  salesInfo: SalesInfo
  onConfirm: () => void
  onEdit: () => void
}

export default function RegistrationSummary({
  images,
  result,
  salesInfo,
  onConfirm,
  onEdit,
}: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getDeliveryText = () => {
    switch (salesInfo.deliveryFeeType) {
      case 'FREE':
        return '무료배송'
      case 'PAID':
        return `${formatPrice(salesInfo.deliveryFee)}원`
      case 'CONDITIONAL_FREE':
        return `${formatPrice(salesInfo.conditionalFreeAmount)}원 이상 무료 / 기본 ${formatPrice(salesInfo.deliveryFee)}원`
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
        <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</span>
        최종 확인
      </h2>

      <div className="space-y-6">
        {/* 이미지 미리보기 */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">등록될 이미지 ({images.length}장)</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img
                  src={img.processed || img.data}
                  alt={`이미지 ${idx + 1}`}
                  className={`h-20 object-cover rounded-lg ${idx === 0 ? 'ring-2 ring-purple-500' : ''}`}
                />
                {idx === 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    대표
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 상품 정보 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌측: 기본 정보 */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-700 border-b pb-2">기본 정보</h3>

            <div className="flex justify-between">
              <span className="text-gray-500">상품명</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">
                {salesInfo.productName || '-'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">카테고리</span>
              <span className="font-medium text-gray-800">
                {salesInfo.categoryName || '-'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">판매가</span>
              <span className="font-bold text-purple-600">
                {formatPrice(salesInfo.salePrice)}원
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">재고수량</span>
              <span className="font-medium text-gray-800">
                {formatPrice(salesInfo.stockQuantity)}개
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">배송비</span>
              <span className="font-medium text-gray-800">
                {getDeliveryText()}
              </span>
            </div>
          </div>

          {/* 우측: 옵션 정보 */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-700 border-b pb-2">옵션 정보</h3>

            <div>
              <span className="text-gray-500 block mb-1">사이즈</span>
              <div className="flex flex-wrap gap-1">
                {salesInfo.sizes.length > 0 ? (
                  salesInfo.sizes.map((size) => (
                    <span key={size} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
                      {size}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">없음</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500 block mb-1">컬러</span>
              <div className="flex flex-wrap gap-1">
                {salesInfo.colors.length > 0 ? (
                  salesInfo.colors.map((color) => (
                    <span key={color} className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-sm">
                      {color}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">없음</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 생성된 문구 요약 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-700 border-b border-purple-200 pb-2 mb-3">생성된 문구</h3>

          <div className="space-y-2">
            <div>
              <span className="text-xs text-purple-600 font-medium">추천 상품명</span>
              <p className="font-bold text-gray-800">{result.productName}</p>
            </div>

            <div>
              <span className="text-xs text-purple-600 font-medium">후킹 카피</span>
              <p className="font-bold text-gray-800">{result.hookingCopy}</p>
            </div>

            <div>
              <span className="text-xs text-purple-600 font-medium">셀링포인트</span>
              <ul className="text-sm text-gray-700 space-y-1">
                {result.sellingPoints.map((point, idx) => (
                  <li key={idx}>• {point.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">등록 전 확인사항</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• 상품 정보가 정확한지 확인해주세요</li>
                <li>• 등록 후 스마트스토어에서 수정 가능합니다</li>
                <li>• 이미지는 네이버 서버에 업로드됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
          >
            수정하기
          </button>
          <button
            onClick={onConfirm}
            className="flex-[2] py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            스마트스토어에 등록하기
          </button>
        </div>
      </div>
    </div>
  )
}
