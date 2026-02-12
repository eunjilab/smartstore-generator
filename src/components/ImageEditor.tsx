'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// 레이어 타입 정의
interface BaseLayer {
  id: string
  visible: boolean
  locked: boolean
}

interface BackgroundLayer extends BaseLayer {
  type: 'background'
  color: string // hex color or 'transparent'
}

interface ImageLayer extends BaseLayer {
  type: 'image'
  imageUrl: string
  scale: number
  x: number
  y: number
  opacity: number
}

interface TextLayer extends BaseLayer {
  type: 'text'
  content: string
  font: string
  fontSize: number
  color: string
  align: 'left' | 'center' | 'right'
  x: number
  y: number
}

type Layer = BackgroundLayer | ImageLayer | TextLayer

interface CropData {
  scale: number
  x: number
  y: number
}

interface Props {
  imageUrl: string
  aspectRatio: number
  initialCropData?: CropData
  uploadedImages?: string[] // 업로드된 이미지 목록
  onSave: (croppedImageUrl: string, cropData: CropData) => void
  onClose: () => void
}

// 프리셋 색상
const PRESET_COLORS = [
  { name: '화이트', value: '#FFFFFF' },
  { name: '블랙', value: '#000000' },
  { name: '라이트그레이', value: '#F5F5F5' },
  { name: '베이지', value: '#F5F5DC' },
  { name: '아이보리', value: '#FFFFF0' },
  { name: '연핑크', value: '#FFE4E1' },
  { name: '연블루', value: '#E6F3FF' },
  { name: '연그린', value: '#E8F5E9' },
  { name: '연퍼플', value: '#F3E5F5' },
  { name: '연옐로우', value: '#FFFDE7' },
]

// 폰트 목록
const FONTS = [
  // 고딕 계열
  { name: 'Pretendard', value: 'Pretendard, sans-serif' },
  { name: 'Noto Sans KR', value: '"Noto Sans KR", sans-serif' },
  { name: 'Nanum Gothic', value: '"Nanum Gothic", sans-serif' },
  { name: 'Spoqa Han Sans', value: '"Spoqa Han Sans Neo", sans-serif' },
  { name: 'IBM Plex Sans KR', value: '"IBM Plex Sans KR", sans-serif' },
  // 명조 계열
  { name: 'Nanum Myeongjo', value: '"Nanum Myeongjo", serif' },
  { name: 'Noto Serif KR', value: '"Noto Serif KR", serif' },
  { name: 'Gowun Batang', value: '"Gowun Batang", serif' },
  // 둥근/귀여운 계열
  { name: 'Jua', value: 'Jua, sans-serif' },
  { name: 'Gowun Dodum', value: '"Gowun Dodum", sans-serif' },
  { name: 'Dongle', value: 'Dongle, sans-serif' },
  { name: 'Cute Font', value: '"Cute Font", cursive' },
  // 손글씨 계열
  { name: 'Gaegu', value: 'Gaegu, cursive' },
  { name: 'Hi Melody', value: '"Hi Melody", cursive' },
  { name: 'Nanum Pen Script', value: '"Nanum Pen Script", cursive' },
  { name: 'Nanum Brush Script', value: '"Nanum Brush Script", cursive' },
  // 굵은/포인트 계열
  { name: 'Black Han Sans', value: '"Black Han Sans", sans-serif' },
  { name: 'Do Hyeon', value: '"Do Hyeon", sans-serif' },
  { name: 'Gugi', value: 'Gugi, cursive' },
  { name: 'Sunflower', value: 'Sunflower, sans-serif' },
  { name: 'Gothic A1', value: '"Gothic A1", sans-serif' },
  // 영문 특화
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
]

type Tool = 'image' | 'addImage' | 'background' | 'text'

export default function ImageEditor({
  imageUrl,
  aspectRatio,
  initialCropData,
  uploadedImages = [],
  onSave,
  onClose,
}: Props) {
  // 이미지 원본 비율 저장
  const [imageNaturalRatio, setImageNaturalRatio] = useState<number>(1)

  // 레이어 상태
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 'bg', type: 'background', color: 'transparent', visible: true, locked: false },
    {
      id: 'main',
      type: 'image',
      imageUrl,
      scale: initialCropData?.scale || 1,
      x: initialCropData?.x || 0,
      y: initialCropData?.y || 0,
      opacity: 100,
      visible: true,
      locked: false,
    },
  ])

  // 이미지 로드 후 초기 스케일 계산 (cover 방식)
  useEffect(() => {
    if (initialCropData?.scale) return // 이미 편집된 경우 스킵

    const img = new Image()
    img.onload = () => {
      const imgRatio = img.width / img.height // 이미지 가로/세로 비율
      setImageNaturalRatio(imgRatio)

      // 1:1 캔버스에 3:4 이미지를 채우려면 가로 기준으로 확대해야 함
      // cover 방식: 캔버스를 완전히 채우는 최소 스케일 계산
      let coverScale = 1

      if (aspectRatio === 1) {
        // 1:1 캔버스
        if (imgRatio < 1) {
          // 세로가 긴 이미지 (3:4 등) → 가로 기준으로 맞춤
          coverScale = 1 / imgRatio
        } else {
          // 가로가 긴 이미지 → 세로 기준으로 맞춤
          coverScale = imgRatio
        }
      } else {
        // 3:4 캔버스 등
        const canvasRatio = aspectRatio
        if (imgRatio < canvasRatio) {
          coverScale = canvasRatio / imgRatio
        }
      }

      // 메인 레이어 스케일 업데이트
      setLayers(prev => prev.map(l =>
        l.id === 'main' ? { ...l, scale: coverScale } as ImageLayer : l
      ))
    }
    img.src = imageUrl
  }, [imageUrl, aspectRatio, initialCropData?.scale])

  const [selectedLayerId, setSelectedLayerId] = useState<string>('main')
  const [activeTool, setActiveTool] = useState<Tool>('image')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showImagePicker, setShowImagePicker] = useState(false)

  // 텍스트 편집 상태
  const [newTextContent, setNewTextContent] = useState('')
  const [newTextFont, setNewTextFont] = useState(FONTS[0].value)
  const [newTextSize, setNewTextSize] = useState(24)
  const [newTextColor, setNewTextColor] = useState('#000000')
  const [newTextAlign, setNewTextAlign] = useState<'left' | 'center' | 'right'>('center')

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 선택된 레이어 가져오기
  const selectedLayer = layers.find(l => l.id === selectedLayerId)

  // 이미지 레이어만 필터링
  const imageLayers = layers.filter(l => l.type === 'image') as ImageLayer[]
  const textLayers = layers.filter(l => l.type === 'text') as TextLayer[]
  const bgLayer = layers.find(l => l.type === 'background') as BackgroundLayer

  // 레이어 업데이트
  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } as Layer : l))
  }

  // 드래그 핸들러 (이미지/텍스트 공통)
  const handleMouseDown = (e: React.MouseEvent, layerId?: string) => {
    if (!selectedLayer || selectedLayer.locked) return
    if (selectedLayer.type === 'background') return

    const targetId = layerId || selectedLayerId
    const layer = layers.find(l => l.id === targetId)
    if (!layer || layer.type === 'background') return

    e.preventDefault()
    setIsDragging(true)
    setSelectedLayerId(targetId)

    const currentX = (layer as ImageLayer | TextLayer).x
    const currentY = (layer as ImageLayer | TextLayer).y

    setDragStart({
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedLayer) return
    if (selectedLayer.type === 'background' || selectedLayer.locked) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    updateLayer(selectedLayerId, { x: newX, y: newY })
  }, [isDragging, selectedLayer, dragStart, selectedLayerId])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // 이미지 추가
  const addImageLayer = (imgUrl: string) => {
    const newLayer: ImageLayer = {
      id: `img-${Date.now()}`,
      type: 'image',
      imageUrl: imgUrl,
      scale: 1,
      x: 0,
      y: 0,
      opacity: 100,
      visible: true,
      locked: false,
    }
    setLayers(prev => {
      const textLayers = prev.filter(l => l.type === 'text')
      const otherLayers = prev.filter(l => l.type !== 'text')
      return [...otherLayers, newLayer, ...textLayers]
    })
    setSelectedLayerId(newLayer.id)
    setShowImagePicker(false)
  }

  // 새 이미지 파일 업로드
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      addImageLayer(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // 텍스트 추가
  const addTextLayer = () => {
    if (!newTextContent.trim()) return

    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: newTextContent,
      font: newTextFont,
      fontSize: newTextSize,
      color: newTextColor,
      align: newTextAlign,
      x: 0,
      y: 0,
      visible: true,
      locked: false,
    }
    setLayers(prev => [...prev, newLayer])
    setSelectedLayerId(newLayer.id)
    setNewTextContent('')
  }

  // 레이어 삭제
  const deleteLayer = (id: string) => {
    if (id === 'main' || id === 'bg') return
    setLayers(prev => prev.filter(l => l.id !== id))
    setSelectedLayerId('main')
  }

  // 이미지 레이어 순서 변경
  const moveImageLayer = (fromIndex: number, toIndex: number) => {
    setLayers(prev => {
      const bg = prev.find(l => l.type === 'background')!
      const images = prev.filter(l => l.type === 'image')
      const texts = prev.filter(l => l.type === 'text')

      const [moved] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, moved)

      return [bg, ...images, ...texts]
    })
  }

  // 초기화
  const handleReset = () => {
    setLayers([
      { id: 'bg', type: 'background', color: 'transparent', visible: true, locked: false },
      {
        id: 'main',
        type: 'image',
        imageUrl,
        scale: 1,
        x: 0,
        y: 0,
        opacity: 100,
        visible: true,
        locked: false,
      },
    ])
    setSelectedLayerId('main')
  }

  // 캔버스에 렌더링 후 저장
  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const outputSize = 1200
    canvas.width = outputSize
    canvas.height = aspectRatio === 1 ? outputSize : outputSize / aspectRatio

    // 배경 그리기
    if (bgLayer.visible && bgLayer.color !== 'transparent') {
      ctx.fillStyle = bgLayer.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // 이미지 레이어 그리기 (순서대로)
    for (const layer of imageLayers) {
      if (!layer.visible) continue

      await new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.globalAlpha = layer.opacity / 100

          // 이미지 중앙 기준 위치 계산
          const scale = layer.scale
          const imgWidth = canvas.width * scale
          const imgHeight = (canvas.width / (img.width / img.height)) * scale

          const x = (canvas.width - imgWidth) / 2 + (layer.x / 300) * canvas.width
          const y = (canvas.height - imgHeight) / 2 + (layer.y / 300) * canvas.height

          ctx.drawImage(img, x, y, imgWidth, imgHeight)
          ctx.globalAlpha = 1
          resolve()
        }
        img.onerror = () => resolve()
        img.src = layer.imageUrl
      })
    }

    // 텍스트 레이어 그리기
    for (const layer of textLayers) {
      if (!layer.visible) continue

      ctx.font = `${layer.fontSize * (canvas.width / 300)}px ${layer.font}`
      ctx.fillStyle = layer.color
      ctx.textAlign = layer.align

      const x = canvas.width / 2 + (layer.x / 300) * canvas.width
      const y = canvas.height / 2 + (layer.y / 300) * canvas.height

      ctx.fillText(layer.content, x, y)
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const mainLayer = layers.find(l => l.id === 'main') as ImageLayer

    onSave(dataUrl, {
      scale: mainLayer?.scale || 1,
      x: mainLayer?.x || 0,
      y: mainLayer?.y || 0
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
          <h3 className="font-semibold text-gray-800 text-center">이미지 편집</h3>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 메인 편집 영역 */}
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            {/* 미리보기 */}
            <div
              ref={containerRef}
              className="relative bg-gray-200 rounded-lg overflow-hidden flex-1 min-h-0"
              style={{ aspectRatio: aspectRatio === 1 ? '1/1' : '3/4', maxHeight: '400px' }}
            >
              {/* 배경색 */}
              {bgLayer.visible && bgLayer.color !== 'transparent' && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: bgLayer.color }}
                />
              )}

              {/* 체크 패턴 (투명 배경 표시) */}
              {(!bgLayer.visible || bgLayer.color === 'transparent') && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  }}
                />
              )}

              {/* 이미지 레이어들 */}
              {imageLayers.map((layer) => (
                layer.visible && (
                  <div
                    key={layer.id}
                    className={`absolute inset-0 flex items-center justify-center cursor-move ${
                      selectedLayerId === layer.id ? 'ring-2 ring-purple-500 ring-inset' : ''
                    }`}
                    style={{
                      transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale})`,
                      opacity: layer.opacity / 100,
                      transition: isDragging && selectedLayerId === layer.id ? 'none' : 'transform 0.1s',
                    }}
                    onMouseDown={(e) => !layer.locked && handleMouseDown(e, layer.id)}
                  >
                    <img
                      src={layer.imageUrl}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                  </div>
                )
              ))}

              {/* 텍스트 레이어들 */}
              {textLayers.map((layer) => (
                layer.visible && (
                  <div
                    key={layer.id}
                    className={`absolute cursor-move ${
                      selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px))`,
                      fontFamily: layer.font,
                      fontSize: `${layer.fontSize}px`,
                      color: layer.color,
                      textAlign: layer.align,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseDown={(e) => !layer.locked && handleMouseDown(e, layer.id)}
                  >
                    {layer.content}
                  </div>
                )
              ))}

              {/* 그리드 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
              </div>
            </div>

            {/* 도구 옵션 패널 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg min-h-[120px]">
              {/* 이미지 도구 */}
              {activeTool === 'image' && selectedLayer?.type === 'image' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-12">확대</span>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={(selectedLayer as ImageLayer).scale}
                      onChange={(e) => updateLayer(selectedLayerId, { scale: parseFloat(e.target.value) })}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-sm text-purple-600 w-12">{(selectedLayer as ImageLayer).scale.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-12">투명도</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(selectedLayer as ImageLayer).opacity}
                      onChange={(e) => updateLayer(selectedLayerId, { opacity: parseInt(e.target.value) })}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-sm text-purple-600 w-12">{(selectedLayer as ImageLayer).opacity}%</span>
                  </div>
                </div>
              )}

              {/* 이미지 추가 도구 */}
              {activeTool === 'addImage' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">이미지를 선택하세요</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => addImageLayer(img)}
                        className="w-16 h-16 rounded border-2 border-gray-200 overflow-hidden hover:border-purple-500"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500"
                    >
                      <span className="text-2xl">+</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* 배경색 도구 */}
              {activeTool === 'background' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">배경색 선택</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateLayer('bg', { color: 'transparent' })}
                      className={`w-8 h-8 rounded border-2 ${bgLayer.color === 'transparent' ? 'border-purple-500' : 'border-gray-200'}`}
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                      }}
                      title="투명"
                    />
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateLayer('bg', { color: c.value })}
                        className={`w-8 h-8 rounded border-2 ${bgLayer.color === c.value ? 'border-purple-500' : 'border-gray-200'}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                    <input
                      type="color"
                      value={bgLayer.color === 'transparent' ? '#ffffff' : bgLayer.color}
                      onChange={(e) => updateLayer('bg', { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                      title="커스텀 색상"
                    />
                  </div>
                </div>
              )}

              {/* 텍스트 도구 */}
              {activeTool === 'text' && (
                <div className="space-y-2">
                  {selectedLayer?.type === 'text' ? (
                    // 선택된 텍스트 편집
                    <>
                      <input
                        type="text"
                        value={(selectedLayer as TextLayer).content}
                        onChange={(e) => updateLayer(selectedLayerId, { content: e.target.value })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        placeholder="텍스트 입력"
                      />
                      <div className="flex gap-2">
                        <select
                          value={(selectedLayer as TextLayer).font}
                          onChange={(e) => updateLayer(selectedLayerId, { font: e.target.value })}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        >
                          {FONTS.map((f) => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={(selectedLayer as TextLayer).fontSize}
                          onChange={(e) => updateLayer(selectedLayerId, { fontSize: parseInt(e.target.value) || 12 })}
                          className="w-16 px-2 py-1 border rounded text-sm"
                          min="12"
                          max="120"
                        />
                        <input
                          type="color"
                          value={(selectedLayer as TextLayer).color}
                          onChange={(e) => updateLayer(selectedLayerId, { color: e.target.value })}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  ) : (
                    // 새 텍스트 추가
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTextContent}
                          onChange={(e) => setNewTextContent(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded text-sm"
                          placeholder="텍스트 입력"
                        />
                        <button
                          onClick={addTextLayer}
                          disabled={!newTextContent.trim()}
                          className="px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300"
                        >
                          추가
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={newTextFont}
                          onChange={(e) => setNewTextFont(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        >
                          {FONTS.map((f) => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={newTextSize}
                          onChange={(e) => setNewTextSize(parseInt(e.target.value) || 12)}
                          className="w-16 px-2 py-1 border rounded text-sm"
                          min="12"
                          max="120"
                        />
                        <input
                          type="color"
                          value={newTextColor}
                          onChange={(e) => setNewTextColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 도구 버튼 */}
            <div className="mt-3 flex justify-center gap-4">
              {[
                { id: 'image' as Tool, icon: '🖼️', label: '이미지' },
                { id: 'addImage' as Tool, icon: '➕', label: '이미지추가' },
                { id: 'background' as Tool, icon: '🎨', label: '배경색' },
                { id: 'text' as Tool, icon: '✏️', label: '텍스트' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    activeTool === tool.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-xl">{tool.icon}</span>
                  <span className="text-xs">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 레이어 패널 */}
          <div className="w-48 border-l bg-gray-50 p-3 overflow-y-auto flex-shrink-0">
            <h4 className="text-sm font-medium text-gray-700 mb-2">레이어 목록</h4>

            {/* 텍스트 레이어들 */}
            {textLayers.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">텍스트</p>
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    onClick={() => { setSelectedLayerId(layer.id); setActiveTool('text'); }}
                    className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                      selectedLayerId === layer.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>📝</span>
                    <span className="flex-1 truncate">{layer.content}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 레이어들 */}
            <div className="mb-2">
              <p className="text-xs text-gray-400 mb-1">이미지</p>
              {[...imageLayers].reverse().map((layer, idx) => (
                <div
                  key={layer.id}
                  onClick={() => { setSelectedLayerId(layer.id); setActiveTool('image'); }}
                  className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                    selectedLayerId === layer.id ? 'bg-purple-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>🖼️</span>
                  <span className="flex-1">{layer.id === 'main' ? '메인' : `이미지${imageLayers.length - idx}`}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                    className={layer.visible ? 'text-gray-600' : 'text-gray-300'}
                  >
                    {layer.visible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  {layer.id !== 'main' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 배경색 레이어 */}
            <div>
              <p className="text-xs text-gray-400 mb-1">배경</p>
              <div
                onClick={() => { setSelectedLayerId('bg'); setActiveTool('background'); }}
                className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                  selectedLayerId === 'bg' ? 'bg-purple-100' : 'hover:bg-gray-100'
                }`}
              >
                <span>🎨</span>
                <span className="flex-1">배경색</span>
                <div
                  className="w-5 h-5 rounded border"
                  style={{
                    backgroundColor: bgLayer.color === 'transparent' ? undefined : bgLayer.color,
                    backgroundImage: bgLayer.color === 'transparent'
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : undefined,
                    backgroundSize: '6px 6px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-3 border-t bg-gray-50 flex gap-2 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-2.5 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600"
          >
            적용
          </button>
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
