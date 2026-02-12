'use client'

import { GeneratedResult } from '@/app/page'
import { useState } from 'react'

interface Props {
  result: GeneratedResult
}

export default function ResultDisplay({ result }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 상품명 추천 */}
      <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-amber-700">추천 상품명</h3>
          <button
            onClick={() => copyToClipboard(result.productName, 'productName')}
            className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
          >
            {copiedField === 'productName' ? '복사됨!' : '복사'}
          </button>
        </div>
        <p className="text-lg font-bold text-gray-800">{result.productName}</p>
      </div>

      {/* 후킹 카피 */}
      <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-purple-700">① 후킹 대표이미지 문구</h3>
          <button
            onClick={() => copyToClipboard(`${result.hookingCopy}\n${result.sizeColor}`, 'hooking')}
            className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            {copiedField === 'hooking' ? '복사됨!' : '복사'}
          </button>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-2">{result.hookingCopy}</p>
        <p className="text-gray-600">{result.sizeColor}</p>
      </div>

      {/* 핵심 셀링포인트 */}
      <div className="p-5 bg-blue-50 rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-blue-700">② 핵심 셀링포인트 3가지</h3>
          <button
            onClick={() => copyToClipboard(
              result.sellingPoints.map(p => `${p.title}\n${p.desc}`).join('\n\n'),
              'selling'
            )}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {copiedField === 'selling' ? '복사됨!' : '복사'}
          </button>
        </div>
        <div className="space-y-4">
          {result.sellingPoints.map((point, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4">
              <p className="font-bold text-gray-800 text-lg">{point.title}</p>
              <p className="text-gray-600">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 착장 사진 사이 문구 */}
      <div className="p-5 bg-green-50 rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-green-700">③ 착장 사진 사이 문구 6개</h3>
          <button
            onClick={() => copyToClipboard(result.outfitCopies.join('\n'), 'captions')}
            className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            {copiedField === 'captions' ? '복사됨!' : '복사'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {result.outfitCopies.map((caption, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-lg text-center font-bold text-gray-700 shadow-sm"
            >
              {caption}
            </div>
          ))}
        </div>
      </div>

      {/* 상품 상세 정보 */}
      <div className="p-5 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-gray-700">④ 상품 상세 정보</h3>
          <button
            onClick={() => copyToClipboard(
              `소재: ${result.detail.material}\n핏: ${result.detail.fit}\n디테일: ${result.detail.detail}\n기타: ${result.detail.etc}`,
              'detail'
            )}
            className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            {copiedField === 'detail' ? '복사됨!' : '복사'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">소재</p>
            <p className="font-medium text-gray-800">{result.detail.material}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">핏</p>
            <p className="font-medium text-gray-800">{result.detail.fit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">디테일</p>
            <p className="font-medium text-gray-800">{result.detail.detail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">기타</p>
            <p className="font-medium text-gray-800">{result.detail.etc}</p>
          </div>
        </div>
      </div>

      {/* 전체 복사 버튼 */}
      <button
        onClick={() => {
          const fullText = `
[상품명]
${result.productName}

[후킹 카피]
${result.hookingCopy}
${result.sizeColor}

[핵심 셀링포인트]
${result.sellingPoints.map((p, i) => `${i + 1}. ${p.title}\n   ${p.desc}`).join('\n\n')}

[착장 문구]
${result.outfitCopies.map((c, i) => `${i + 1}. ${c}`).join('\n')}

[상품 상세]
- 소재: ${result.detail.material}
- 핏: ${result.detail.fit}
- 디테일: ${result.detail.detail}
- 기타: ${result.detail.etc}
          `.trim()
          copyToClipboard(fullText, 'all')
        }}
        className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900"
      >
        {copiedField === 'all' ? '전체 복사됨!' : '전체 복사하기'}
      </button>
    </div>
  )
}
