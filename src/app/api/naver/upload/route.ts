import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/utils/naverCommerce'

interface UploadRequest {
  images: {
    data: string  // base64
    type: 'REPRESENTATIVE' | 'DETAIL'
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json()
    const { images } = body

    if (!images || images.length === 0) {
      return NextResponse.json({ error: '이미지가 필요합니다' }, { status: 400 })
    }

    // 모든 이미지 업로드
    const uploadedUrls = await Promise.all(
      images.map(async (img) => {
        try {
          const url = await uploadImage(img.data, img.type)
          return { url, type: img.type, success: true }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error('이미지 업로드 실패:', { type: img.type, error: errorMsg })
          return { url: '', type: img.type, success: false, error: errorMsg }
        }
      })
    )

    const successCount = uploadedUrls.filter(u => u.success).length
    const failCount = uploadedUrls.filter(u => !u.success).length

    return NextResponse.json({
      success: failCount === 0,
      uploadedImages: uploadedUrls,
      message: `${successCount}개 업로드 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`,
    })
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
