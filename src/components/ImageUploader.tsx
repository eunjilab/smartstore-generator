'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageItem, CropData } from '@/app/page'
import ImageEditor from './ImageEditor'

interface Props {
  images: ImageItem[]
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>
}

export default function ImageUploader({ images, setImages }: Props) {
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageItem[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      type: images.length === 0 && index === 0 ? 'main' : 'outfit' as const,
    }))

    setImages((prev) => [...prev, ...newImages])
  }, [images.length, setImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
  })

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      // 첫 번째 이미지는 자동으로 대표로 설정
      if (filtered.length > 0 && filtered[0].type !== 'main') {
        filtered[0] = { ...filtered[0], type: 'main' }
      }
      return filtered
    })
  }

  const changeType = (id: string, type: 'main' | 'outfit' | 'detail') => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          return { ...img, type }
        }
        // main은 하나만
        if (type === 'main' && img.type === 'main') {
          return { ...img, type: 'outfit' }
        }
        return img
      })
    )
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      // 첫 번째를 대표로
      return newImages.map((img, i) => ({
        ...img,
        type: i === 0 ? 'main' : img.type === 'main' ? 'outfit' : img.type,
      }))
    })
  }

  // 이미지 편집 열기
  const openEditor = (img: ImageItem) => {
    setEditingImage(img)
  }

  // 편집 저장
  const handleEditorSave = (croppedImageUrl: string, cropData: CropData) => {
    if (!editingImage) return

    setImages((prev) =>
      prev.map((img) => {
        if (img.id === editingImage.id) {
          return {
            ...img,
            editedPreview: croppedImageUrl,
            cropData,
          }
        }
        return img
      })
    )
    setEditingImage(null)
  }

  // 편집된 이미지 표시할 URL 결정
  const getDisplayUrl = (img: ImageItem) => {
    return img.editedPreview || img.preview
  }

  // 이미지 비율 결정 (대표: 1:1, 나머지: 3:4)
  const getAspectRatio = (img: ImageItem, index: number) => {
    return index === 0 || img.type === 'main' ? 1 : 0.75
  }

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-2">📸</div>
        {isDragActive ? (
          <p className="text-purple-600 font-medium">이미지를 놓으세요</p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium">이미지를 드래그하거나 클릭해서 업로드</p>
            <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP 지원</p>
          </div>
        )}
      </div>

      {/* 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative group"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const fromIndex = parseInt(e.dataTransfer.getData('index'))
                moveImage(fromIndex, index)
              }}
            >
              {/* 이미지 */}
              <div
                className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                  img.type === 'main' ? 'border-purple-500' : 'border-transparent'
                } ${img.editedPreview ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                onClick={() => openEditor(img)}
              >
                <img
                  src={getDisplayUrl(img)}
                  alt={`상품 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 타입 배지 */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  img.type === 'main'
                    ? 'bg-purple-500 text-white'
                    : img.type === 'outfit'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {img.type === 'main' ? '대표' : img.type === 'outfit' ? '착장' : '디테일'}
                </span>
                {img.editedPreview && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white">
                    편집됨
                  </span>
                )}
              </div>

              {/* 순서 번호 */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>

              {/* 편집 버튼 (항상 표시) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditor(img)
                }}
                className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-white/90 text-gray-700 rounded shadow hover:bg-white transition-colors"
              >
                ✂️ 편집
              </button>

              {/* 호버 시 컨트롤 */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                {/* 편집 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditor(img)
                  }}
                  className="text-xs px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  ✂️ 편집하기
                </button>

                {/* 타입 변경 */}
                <select
                  value={img.type}
                  onChange={(e) => changeType(img.id, e.target.value as 'main' | 'outfit' | 'detail')}
                  className="text-xs px-2 py-1 rounded bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="main">대표컷</option>
                  <option value="outfit">착장컷</option>
                  <option value="detail">디테일컷</option>
                </select>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(img.id)
                  }}
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 안내 */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 text-center space-y-1">
          <p>이미지를 클릭하여 편집 | 드래그해서 순서 변경</p>
          <p className="text-xs text-gray-400">첫 번째 이미지: 1:1 비율 | 나머지: 3:4 비율</p>
        </div>
      )}

      {/* 이미지 에디터 모달 */}
      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.preview}
          aspectRatio={getAspectRatio(editingImage, images.findIndex(img => img.id === editingImage.id))}
          initialCropData={editingImage.cropData}
          uploadedImages={images.map(img => img.preview)}
          onSave={handleEditorSave}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  )
}
