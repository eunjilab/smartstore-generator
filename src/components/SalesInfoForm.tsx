'use client'

import { useState, useEffect } from 'react'

export interface SalesInfo {
  productName: string
  salePrice: number
  stockQuantity: number
  deliveryFeeType: 'FREE' | 'PAID' | 'CONDITIONAL_FREE'
  deliveryFee: number
  conditionalFreeAmount: number
  categoryId: string
  categoryName: string
  sizes: string[]
  colors: string[]
}

interface Props {
  salesInfo: SalesInfo
  setSalesInfo: React.Dispatch<React.SetStateAction<SalesInfo>>
  suggestedProductName?: string
  suggestedCategoryId?: string
  inputSize?: string
  inputColors?: string
}

// 인기 카테고리 목록
const POPULAR_CATEGORIES = [
  { id: '50000804', name: '원피스' },
  { id: '50000167', name: '블라우스/셔츠' },
  { id: '50000160', name: '니트/스웨터' },
  { id: '50000158', name: '티셔츠' },
  { id: '50000171', name: '팬츠' },
  { id: '50000169', name: '스커트' },
  { id: '50000163', name: '자켓' },
  { id: '50000165', name: '코트' },
  { id: '50000162', name: '가디건' },
  { id: '50000201', name: '남성 티셔츠' },
  { id: '50000203', name: '남성 셔츠' },
  { id: '50000207', name: '남성 팬츠' },
]

const SIZE_OPTIONS = ['FREE', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '44', '55', '66', '77', '88']
const COLOR_OPTIONS = ['블랙', '화이트', '그레이', '네이비', '베이지', '브라운', '아이보리', '핑크', '레드', '블루', '그린', '옐로우', '퍼플', '오렌지']

export default function SalesInfoForm({
  salesInfo,
  setSalesInfo,
  suggestedProductName,
  suggestedCategoryId,
  inputSize,
  inputColors,
}: Props) {
  const [showCategorySearch, setShowCategorySearch] = useState(false)

  // 추천된 상품명 자동 적용
  useEffect(() => {
    if (suggestedProductName && !salesInfo.productName) {
      setSalesInfo((prev) => ({ ...prev, productName: suggestedProductName }))
    }
  }, [suggestedProductName, salesInfo.productName, setSalesInfo])

  // 추천된 카테고리 자동 적용
  useEffect(() => {
    if (suggestedCategoryId && !salesInfo.categoryId) {
      const category = POPULAR_CATEGORIES.find((c) => c.id === suggestedCategoryId)
      if (category) {
        setSalesInfo((prev) => ({
          ...prev,
          categoryId: category.id,
          categoryName: category.name,
        }))
      }
    }
  }, [suggestedCategoryId, salesInfo.categoryId, setSalesInfo])

  // 입력된 사이즈/컬러 자동 파싱
  useEffect(() => {
    if (inputSize && salesInfo.sizes.length === 0) {
      const sizes = inputSize
        .split(/[,/·\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter((s) => SIZE_OPTIONS.includes(s) || s)
      if (sizes.length > 0) {
        setSalesInfo((prev) => ({ ...prev, sizes }))
      }
    }
  }, [inputSize, salesInfo.sizes.length, setSalesInfo])

  useEffect(() => {
    if (inputColors && salesInfo.colors.length === 0) {
      const colors = inputColors
        .split(/[,/·\s]+/)
        .map((c) => c.trim())
        .filter((c) => c)
      if (colors.length > 0) {
        setSalesInfo((prev) => ({ ...prev, colors }))
      }
    }
  }, [inputColors, salesInfo.colors.length, setSalesInfo])

  const handleChange = (field: keyof SalesInfo, value: string | number | string[]) => {
    setSalesInfo((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSize = (size: string) => {
    const newSizes = salesInfo.sizes.includes(size)
      ? salesInfo.sizes.filter((s) => s !== size)
      : [...salesInfo.sizes, size]
    handleChange('sizes', newSizes)
  }

  const toggleColor = (color: string) => {
    const newColors = salesInfo.colors.includes(color)
      ? salesInfo.colors.filter((c) => c !== color)
      : [...salesInfo.colors, color]
    handleChange('colors', newColors)
  }

  return (
    <div className="space-y-6">
      {/* 상품명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상품명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={salesInfo.productName}
          onChange={(e) => handleChange('productName', e.target.value)}
          placeholder="상품명을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
        {suggestedProductName && salesInfo.productName !== suggestedProductName && (
          <button
            onClick={() => handleChange('productName', suggestedProductName)}
            className="mt-2 text-sm text-green-600 hover:underline"
          >
            AI 추천: "{suggestedProductName}" 적용하기
          </button>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategorySearch(!showCategorySearch)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex justify-between items-center hover:border-green-500"
          >
            <span className={salesInfo.categoryName ? 'text-gray-900' : 'text-gray-400'}>
              {salesInfo.categoryName || '카테고리를 선택하세요'}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCategorySearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    handleChange('categoryId', cat.id)
                    handleChange('categoryName', cat.name)
                    setShowCategorySearch(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-green-50 ${
                    salesInfo.categoryId === cat.id ? 'bg-green-100 text-green-700' : ''
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 가격/재고 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            판매가 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={salesInfo.salePrice || ''}
              onChange={(e) => handleChange('salePrice', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            재고수량 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={salesInfo.stockQuantity || ''}
              onChange={(e) => handleChange('stockQuantity', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">개</span>
          </div>
        </div>
      </div>

      {/* 배송비 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">배송비</label>
        <div className="flex gap-2 mb-3">
          {[
            { value: 'FREE', label: '무료배송' },
            { value: 'PAID', label: '유료배송' },
            { value: 'CONDITIONAL_FREE', label: '조건부 무료' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('deliveryFeeType', option.value as SalesInfo['deliveryFeeType'])}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                salesInfo.deliveryFeeType === option.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {salesInfo.deliveryFeeType !== 'FREE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">배송비</label>
              <div className="relative">
                <input
                  type="number"
                  value={salesInfo.deliveryFee || ''}
                  onChange={(e) => handleChange('deliveryFee', parseInt(e.target.value) || 0)}
                  placeholder="3000"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
              </div>
            </div>

            {salesInfo.deliveryFeeType === 'CONDITIONAL_FREE' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">무료배송 기준금액</label>
                <div className="relative">
                  <input
                    type="number"
                    value={salesInfo.conditionalFreeAmount || ''}
                    onChange={(e) => handleChange('conditionalFreeAmount', parseInt(e.target.value) || 0)}
                    placeholder="50000"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 사이즈 옵션 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사이즈 옵션
          {salesInfo.sizes.length > 0 && (
            <span className="ml-2 text-green-600">({salesInfo.sizes.join(', ')})</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                salesInfo.sizes.includes(size)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 컬러 옵션 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          컬러 옵션
          {salesInfo.colors.length > 0 && (
            <span className="ml-2 text-green-600">({salesInfo.colors.join(', ')})</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                salesInfo.colors.includes(color)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
