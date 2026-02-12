'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageItem, CropData, ColorOutfit, ImageData } from '@/app/page'
import ImageEditor from './ImageEditor'

// 컬러 프리셋
const COLOR_PRESETS = [
  '블랙', '화이트', '아이보리', '베이지', '그레이',
  '네이비', '브라운', '카키', '핑크', '블루'
]

interface Props {
  imageData: ImageData
  setImageData: React.Dispatch<React.SetStateAction<ImageData>>
  // 기존 호환성을 위한 props
  images?: ImageItem[]
  setImages?: React.Dispatch<React.SetStateAction<ImageItem[]>>
}

export default function ImageUploader({ imageData, setImageData }: Props) {
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null)
  const [editingContext, setEditingContext] = useState<{ type: 'main' | 'sizeChart' | 'color', colorId?: string } | null>(null)

  // 메인 이미지 드롭존
  const onDropMain = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const newImage: ImageItem = {
        id: `main-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        type: 'main',
      }
      setImageData(prev => ({ ...prev, mainImage: newImage }))
    }
  }, [setImageData])

  // 사이즈표 드롭존
  const onDropSizeChart = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const newImage: ImageItem = {
        id: `sizechart-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
        type: 'sizeChart',
      }
      setImageData(prev => ({ ...prev, sizeChartImage: newImage }))
    }
  }, [setImageData])

  const mainDropzone = useDropzone({
    onDrop: onDropMain,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  })

  const sizeChartDropzone = useDropzone({
    onDrop: onDropSizeChart,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  })

  // 컬러 추가
  const addColor = () => {
    const newColor: ColorOutfit = {
      id: `color-${Date.now()}`,
      colorName: '',
      isMain: imageData.colorOutfits.length === 0, // 첫 번째 컬러는 자동으로 대표
      images: [],
    }
    setImageData(prev => ({
      ...prev,
      colorOutfits: [...prev.colorOutfits, newColor]
    }))
  }

  // 컬러 삭제
  const removeColor = (colorId: string) => {
    setImageData(prev => {
      const filtered = prev.colorOutfits.filter(c => c.id !== colorId)
      // 대표 컬러가 삭제되면 첫 번째를 대표로
      if (filtered.length > 0 && !filtered.some(c => c.isMain)) {
        filtered[0].isMain = true
      }
      return { ...prev, colorOutfits: filtered }
    })
  }

  // 컬러명 변경
  const updateColorName = (colorId: string, name: string) => {
    setImageData(prev => ({
      ...prev,
      colorOutfits: prev.colorOutfits.map(c =>
        c.id === colorId ? { ...c, colorName: name } : c
      )
    }))
  }

  // 대표 컬러 변경
  const setMainColor = (colorId: string) => {
    setImageData(prev => ({
      ...prev,
      colorOutfits: prev.colorOutfits.map(c => ({
        ...c,
        isMain: c.id === colorId
      }))
    }))
  }

  // 컬러에 이미지 추가
  const addImagesToColor = (colorId: string, files: File[]) => {
    const newImages: ImageItem[] = files.map((file, index) => ({
      id: `${colorId}-img-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      type: 'outfit' as const,
    }))

    setImageData(prev => ({
      ...prev,
      colorOutfits: prev.colorOutfits.map(c =>
        c.id === colorId ? { ...c, images: [...c.images, ...newImages] } : c
      )
    }))
  }

  // 컬러에서 이미지 삭제
  const removeImageFromColor = (colorId: string, imageId: string) => {
    setImageData(prev => ({
      ...prev,
      colorOutfits: prev.colorOutfits.map(c =>
        c.id === colorId
          ? { ...c, images: c.images.filter(img => img.id !== imageId) }
          : c
      )
    }))
  }

  // 이미지 편집 열기
  const openEditor = (img: ImageItem, context: { type: 'main' | 'sizeChart' | 'color', colorId?: string }) => {
    setEditingImage(img)
    setEditingContext(context)
  }

  // 편집 저장
  const handleEditorSave = (croppedImageUrl: string, cropData: CropData) => {
    if (!editingImage || !editingContext) return

    if (editingContext.type === 'main') {
      setImageData(prev => ({
        ...prev,
        mainImage: prev.mainImage ? { ...prev.mainImage, editedPreview: croppedImageUrl, cropData } : null
      }))
    } else if (editingContext.type === 'sizeChart') {
      setImageData(prev => ({
        ...prev,
        sizeChartImage: prev.sizeChartImage ? { ...prev.sizeChartImage, editedPreview: croppedImageUrl, cropData } : null
      }))
    } else if (editingContext.type === 'color' && editingContext.colorId) {
      setImageData(prev => ({
        ...prev,
        colorOutfits: prev.colorOutfits.map(c =>
          c.id === editingContext.colorId
            ? {
                ...c,
                images: c.images.map(img =>
                  img.id === editingImage.id ? { ...img, editedPreview: croppedImageUrl, cropData } : img
                )
              }
            : c
        )
      }))
    }
    setEditingImage(null)
    setEditingContext(null)
  }

  // 컬러별 드롭존 컴포넌트
  const ColorImageDropzone = ({ colorId }: { colorId: string }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      addImagesToColor(colorId, acceptedFiles)
    }, [colorId])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    })

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        <input {...getInputProps()} />
        <span className="text-2xl">+</span>
        <p className="text-sm text-gray-500 mt-1">이미지 추가</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 메인 대표사진 */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-xl">📷</span> 메인대표사진 (1:1 비율)
        </h3>
        {imageData.mainImage ? (
          <div className="relative inline-block">
            <div
              className="w-48 h-48 rounded-lg overflow-hidden border-2 border-purple-500 cursor-pointer"
              onClick={() => openEditor(imageData.mainImage!, { type: 'main' })}
            >
              <img
                src={imageData.mainImage.editedPreview || imageData.mainImage.preview}
                alt="메인 대표사진"
                className="w-full h-full object-cover"
              />
            </div>
            {imageData.mainImage.editedPreview && (
              <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded bg-green-500 text-white">
                편집됨
              </span>
            )}
            <button
              onClick={() => setImageData(prev => ({ ...prev, mainImage: null }))}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            {...mainDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              mainDropzone.isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            <input {...mainDropzone.getInputProps()} />
            <div className="text-3xl mb-2">📸</div>
            <p className="text-gray-600">메인 대표사진 업로드</p>
            <p className="text-gray-400 text-sm mt-1">1:1 비율로 자동 크롭됩니다</p>
          </div>
        )}
      </div>

      {/* 사이즈표 이미지 */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-xl">📏</span> 사이즈표 이미지
        </h3>
        {imageData.sizeChartImage ? (
          <div className="relative inline-block">
            <div
              className="max-w-xs rounded-lg overflow-hidden border-2 border-blue-500 cursor-pointer"
              onClick={() => openEditor(imageData.sizeChartImage!, { type: 'sizeChart' })}
            >
              <img
                src={imageData.sizeChartImage.editedPreview || imageData.sizeChartImage.preview}
                alt="사이즈표"
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => setImageData(prev => ({ ...prev, sizeChartImage: null }))}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            {...sizeChartDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              sizeChartDropzone.isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...sizeChartDropzone.getInputProps()} />
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-600">사이즈표 이미지 업로드</p>
            <p className="text-gray-400 text-sm mt-1">원본 비율 유지</p>
          </div>
        )}
      </div>

      {/* 컬러별 코디컷 */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-xl">🎨</span> 컬러별 코디컷
        </h3>

        {/* 컬러 목록 */}
        <div className="space-y-4">
          {imageData.colorOutfits.map((color) => (
            <div key={color.id} className="bg-white border rounded-lg p-4">
              {/* 컬러 헤더 */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <select
                  value={COLOR_PRESETS.includes(color.colorName) ? color.colorName : '직접입력'}
                  onChange={(e) => {
                    if (e.target.value !== '직접입력') {
                      updateColorName(color.id, e.target.value)
                    }
                  }}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">컬러 선택</option>
                  {COLOR_PRESETS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="직접입력">직접입력</option>
                </select>

                {!COLOR_PRESETS.includes(color.colorName) && (
                  <input
                    type="text"
                    value={color.colorName}
                    onChange={(e) => updateColorName(color.id, e.target.value)}
                    placeholder="컬러명 입력"
                    className="px-3 py-2 border rounded-lg text-sm w-32"
                  />
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={color.isMain}
                    onChange={() => setMainColor(color.id)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className={`text-sm ${color.isMain ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
                    ★ 대표컬러
                  </span>
                </label>

                <button
                  onClick={() => removeColor(color.id)}
                  className="ml-auto px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded"
                >
                  삭제
                </button>
              </div>

              {/* 코디컷 이미지들 */}
              <div className="flex flex-wrap gap-3">
                {color.images.map((img) => (
                  <div key={img.id} className="relative">
                    <div
                      className={`w-24 h-32 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        img.editedPreview ? 'border-green-400' : 'border-gray-300'
                      }`}
                      onClick={() => openEditor(img, { type: 'color', colorId: color.id })}
                    >
                      <img
                        src={img.editedPreview || img.preview}
                        alt="코디컷"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImageFromColor(color.id, img.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <ColorImageDropzone colorId={color.id} />
              </div>
            </div>
          ))}

          {/* 컬러 추가 버튼 */}
          <button
            onClick={addColor}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            + 컬러 추가
          </button>
        </div>
      </div>

      {/* 업로드 현황 */}
      {(imageData.mainImage || imageData.sizeChartImage || imageData.colorOutfits.length > 0) && (
        <div className="text-sm text-gray-500 text-center p-3 bg-gray-100 rounded-lg">
          <p>
            메인사진: {imageData.mainImage ? '✓' : '✗'} |
            사이즈표: {imageData.sizeChartImage ? '✓' : '✗'} |
            컬러: {imageData.colorOutfits.length}개 |
            대표컬러 코디컷: {imageData.colorOutfits.find(c => c.isMain)?.images.length || 0}장
          </p>
        </div>
      )}

      {/* 이미지 에디터 모달 */}
      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.preview}
          aspectRatio={editingContext?.type === 'main' ? 1 : 0.75}
          initialCropData={editingImage.cropData}
          uploadedImages={[]}
          onSave={handleEditorSave}
          onClose={() => {
            setEditingImage(null)
            setEditingContext(null)
          }}
        />
      )}
    </div>
  )
}
