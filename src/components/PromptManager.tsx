'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DEFAULT_FEMALE_PROMPT,
  DEFAULT_MALE_PROMPT,
  getSavedPrompt,
  savePrompt,
  resetPrompt,
} from '@/constants/prompts'

interface Props {
  onClose: () => void
}

type TabType = 'female' | 'male'

export default function PromptManager({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('female')
  const [femalePrompt, setFemalePrompt] = useState('')
  const [malePrompt, setMalePrompt] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  // 초기 로드
  useEffect(() => {
    setFemalePrompt(getSavedPrompt('female'))
    setMalePrompt(getSavedPrompt('male'))
  }, [])

  // 현재 프롬프트
  const currentPrompt = activeTab === 'female' ? femalePrompt : malePrompt
  const setCurrentPrompt = activeTab === 'female' ? setFemalePrompt : setMalePrompt

  // 줄 번호 계산
  const lineCount = currentPrompt.split('\n').length

  // 스크롤 동기화
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // 텍스트 변경
  const handleChange = (value: string) => {
    setCurrentPrompt(value)
    setHasChanges(true)
    setIsSaved(false)
  }

  // 저장
  const handleSave = () => {
    savePrompt('female', femalePrompt)
    savePrompt('male', malePrompt)
    setIsSaved(true)
    setHasChanges(false)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // 기본값으로 되돌리기
  const handleReset = () => {
    if (confirm(`${activeTab === 'female' ? '여성용' : '남성용'} 프롬프트를 기본값으로 되돌리시겠습니까?`)) {
      const defaultPrompt = resetPrompt(activeTab)
      setCurrentPrompt(defaultPrompt)
      setHasChanges(true)
    }
  }

  // 닫기 (변경사항 있으면 확인)
  const handleClose = () => {
    if (hasChanges) {
      if (confirm('저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">프롬프트 관리</h2>
              <p className="text-sm text-gray-500">AI에게 보내는 시스템 프롬프트를 수정합니다</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b px-4">
          <button
            onClick={() => setActiveTab('female')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'female'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            여성용 프롬프트
          </button>
          <button
            onClick={() => setActiveTab('male')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'male'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            남성용 프롬프트
          </button>
        </div>

        {/* 에디터 영역 */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full border rounded-xl overflow-hidden flex bg-gray-50">
            {/* 줄 번호 */}
            <div
              ref={lineNumbersRef}
              className="bg-gray-100 text-gray-400 text-sm font-mono py-3 px-2 text-right select-none overflow-hidden border-r"
              style={{ minWidth: '3rem' }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* 텍스트 에디터 */}
            <textarea
              ref={textareaRef}
              value={currentPrompt}
              onChange={(e) => handleChange(e.target.value)}
              onScroll={handleScroll}
              className="flex-1 p-3 font-mono text-sm leading-6 resize-none focus:outline-none bg-white"
              spellCheck={false}
              placeholder="프롬프트를 입력하세요..."
            />
          </div>

          {/* 변수 안내 */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-1">사용 가능한 변수</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{'{{features}}'}</code>
              <span className="text-blue-600">특이사항</span>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{'{{size}}'}</code>
              <span className="text-blue-600">사이즈</span>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{'{{colors}}'}</code>
              <span className="text-blue-600">컬러</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              기본값으로 되돌리기
            </button>
            {hasChanges && (
              <span className="text-xs text-orange-500">변경사항 있음</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                저장됨
              </span>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
