'use client'

import { useState, useRef } from 'react'

interface Props {
  html: string
  onClose: () => void
}

export default function HTMLPreview({ html, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'detail-page.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">상세페이지 HTML</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'preview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            미리보기
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'code'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            HTML 코드
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' ? (
            <div className="p-4 bg-gray-100 min-h-full">
              <div className="max-w-[375px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  className="w-full h-[600px] border-0"
                  title="상세페이지 미리보기"
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">
                모바일 미리보기 (375px)
              </p>
            </div>
          ) : (
            <div className="p-4">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs leading-relaxed max-h-[500px]">
                <code>{html}</code>
              </pre>
            </div>
          )}
        </div>

        {/* 푸터 버튼들 */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700"
          >
            {copied ? '복사됨!' : 'HTML 코드 복사'}
          </button>
          <button
            onClick={downloadHTML}
            className="flex-1 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900"
          >
            HTML 파일 다운로드
          </button>
        </div>
      </div>
    </div>
  )
}
