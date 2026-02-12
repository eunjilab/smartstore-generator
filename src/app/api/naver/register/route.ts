import { NextRequest, NextResponse } from 'next/server'
import { registerProduct, ProductRegistration } from '@/utils/naverCommerce'

interface RegisterRequest {
  product: ProductRegistration
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { product } = body

    // 필수 필드 검증
    if (!product.name || !product.salePrice || !product.categoryId) {
      return NextResponse.json(
        { error: '상품명, 판매가, 카테고리는 필수입니다' },
        { status: 400 }
      )
    }

    if (!product.representativeImage) {
      return NextResponse.json(
        { error: '대표이미지 URL이 필요합니다' },
        { status: 400 }
      )
    }

    // 상품 등록
    const result = await registerProduct(product)

    return NextResponse.json({
      success: true,
      productId: result.productId,
      message: '상품이 등록되었습니다',
    })
  } catch (error) {
    console.error('Register API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '상품 등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
