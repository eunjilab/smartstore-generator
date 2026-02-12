'use client'

import { ProductInfo } from '@/app/page'

interface Props {
  productInfo: ProductInfo
  setProductInfo: React.Dispatch<React.SetStateAction<ProductInfo>>
}

export default function ProductForm({ productInfo, setProductInfo }: Props) {
  const handleChange = (field: keyof ProductInfo, value: string) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-5">
      {/* 성별 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={productInfo.gender === 'female'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-gray-700">여성</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={productInfo.gender === 'male'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-gray-700">남성</span>
          </label>
        </div>
      </div>

      {/* 특이사항 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          특이사항
          <span className="text-gray-400 font-normal ml-2">예: 퍼프소매, 셔링, A라인, 밴딩</span>
        </label>
        <input
          type="text"
          value={productInfo.features}
          onChange={(e) => handleChange('features', e.target.value)}
          placeholder="상품의 특이사항을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 사이즈 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사이즈
          <span className="text-gray-400 font-normal ml-2">예: FREE / S~XL / 44~77</span>
        </label>
        <input
          type="text"
          value={productInfo.size}
          onChange={(e) => handleChange('size', e.target.value)}
          placeholder="사이즈 정보를 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 컬러 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          컬러
          <span className="text-gray-400 font-normal ml-2">예: 아이보리 · 핑크 · 블랙</span>
        </label>
        <input
          type="text"
          value={productInfo.colors}
          onChange={(e) => handleChange('colors', e.target.value)}
          placeholder="컬러 정보를 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  )
}
