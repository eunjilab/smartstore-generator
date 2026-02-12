import { NextRequest, NextResponse } from 'next/server'
import { getCategories, suggestCategory } from '@/utils/naverCommerce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || undefined

    const categories = await getCategories(keyword)

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 카테고리 추천 (AI 분석 기반)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productType, gender } = body

    if (!productType || !gender) {
      return NextResponse.json(
        { error: '상품 타입과 성별이 필요합니다' },
        { status: 400 }
      )
    }

    const suggestedCategoryIds = suggestCategory(productType, gender)

    return NextResponse.json({
      success: true,
      suggestedCategoryIds,
    })
  } catch (error) {
    console.error('Category Suggest API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '카테고리 추천 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
