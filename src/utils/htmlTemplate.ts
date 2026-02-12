// 상세페이지 HTML 템플릿 생성

interface GeneratedResult {
  productName: string
  hookingCopy: string
  sizeColor: string
  sellingPoints: { title: string; desc: string }[]
  outfitCopies: string[]
  detail: {
    material: string
    fit: string
    detail: string
    etc: string
  }
}

interface ProcessedImage {
  type: string
  data: string
  processed: string
}

// 컬러 정보 (page.tsx에서 전달)
interface ColorInfo {
  name: string
  isMain: boolean
}

export function generateDetailPageHTML(
  images: ProcessedImage[],
  result: GeneratedResult,
  colors?: ColorInfo[]
): string {
  const mainImage = images.find((img) => img.type === 'main') || images[0]
  const sizeChartImage = images.find((img) => img.type === 'sizeChart')
  const outfitImages = images.filter((img) => img.type === 'outfit')

  // 컬러 정보가 없으면 sizeColor에서 추출 시도
  const colorList = colors || []
  const mainColor = colorList.find(c => c.isMain)

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #222;
      line-height: 1.6;
    }
    .container {
      max-width: 750px;
      margin: 0 auto;
      background: #fff;
    }
    img {
      width: 100%;
      display: block;
    }

    /* 1. 후킹문구 */
    .hooking-section {
      padding: 50px 20px;
      text-align: center;
      background: linear-gradient(135deg, #faf5f5 0%, #f5f0f0 100%);
    }
    .hooking-copy {
      font-size: 32pt;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      line-height: 1.3;
    }
    .size-color-info {
      font-size: 14pt;
      color: #666;
      font-weight: 400;
    }

    /* 2. 메인대표사진 */
    .main-image-section {
      position: relative;
    }
    .main-image-section img {
      aspect-ratio: 1/1;
      object-fit: cover;
    }

    /* 3. 사이즈표 */
    .size-chart-section {
      padding: 0;
      background: #fff;
    }
    .size-chart-section img {
      width: 100%;
      height: auto;
    }

    /* 4. 셀링포인트 섹션 */
    .selling-section {
      padding: 50px 24px;
      background: #fff;
    }
    .selling-title {
      font-size: 20pt;
      font-weight: 700;
      text-align: center;
      margin-bottom: 40px;
      color: #1a1a1a;
    }
    .selling-point {
      margin-bottom: 32px;
      padding: 24px;
      background: #f9f9f9;
      border-radius: 12px;
    }
    .selling-point-title {
      font-size: 18pt;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    .selling-point-desc {
      font-size: 14pt;
      color: #666;
      line-height: 1.7;
    }

    /* 5. 대표컬러 표시 */
    .color-display-section {
      padding: 40px 20px;
      text-align: center;
      background: #fafafa;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    .color-title {
      font-size: 16pt;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    .color-list {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .color-item {
      font-size: 14pt;
      color: #666;
    }
    .color-item.active {
      color: #1a1a1a;
      font-weight: 600;
    }
    .color-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
    .color-dot.filled {
      background: #1a1a1a;
    }
    .color-dot.empty {
      border: 2px solid #999;
      background: transparent;
    }

    /* 6. 대표컬러 코디컷 + 문구 */
    .outfit-section {
      background: #fff;
    }
    .outfit-item {
      position: relative;
    }
    .outfit-item img {
      aspect-ratio: 3/4;
      object-fit: cover;
    }
    .outfit-text {
      padding: 30px 20px;
      text-align: center;
      background: #fafafa;
    }
    .outfit-caption {
      font-size: 22pt;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.3px;
    }

    /* 7. 상품 정보 섹션 */
    .product-info-section {
      padding: 40px 24px;
      background: #f9f9f9;
    }
    .product-info-title {
      font-size: 18pt;
      font-weight: 700;
      text-align: center;
      margin-bottom: 24px;
      color: #1a1a1a;
    }
    .product-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .product-info-item {
      padding: 16px;
      background: #fff;
      border-radius: 8px;
    }
    .product-info-label {
      font-size: 12pt;
      color: #999;
      margin-bottom: 4px;
    }
    .product-info-value {
      font-size: 14pt;
      color: #333;
      font-weight: 500;
    }

    /* 푸터 */
    .footer {
      padding: 50px 20px;
      text-align: center;
      background: #f5f5f5;
      color: #999;
      font-size: 12pt;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 1. 후킹문구 -->
    <section class="hooking-section">
      <h1 class="hooking-copy">${result.hookingCopy}</h1>
      <p class="size-color-info">${result.sizeColor}</p>
    </section>

    <!-- 2. 메인대표사진 -->
    <section class="main-image-section">
      <img src="${mainImage?.processed || mainImage?.data}" alt="대표이미지">
    </section>

    ${sizeChartImage ? `
    <!-- 3. 사이즈표 -->
    <section class="size-chart-section">
      <img src="${sizeChartImage.processed || sizeChartImage.data}" alt="사이즈표">
    </section>
    ` : ''}

    <!-- 4. 셀링포인트 3가지 -->
    <section class="selling-section">
      <h2 class="selling-title">이 상품이 특별한 이유</h2>
      ${result.sellingPoints
        .map(
          (point) => `
        <div class="selling-point">
          <h3 class="selling-point-title">${point.title}</h3>
          <p class="selling-point-desc">${point.desc}</p>
        </div>
      `
        )
        .join('')}
    </section>

    ${colorList.length > 0 ? `
    <!-- 5. 대표컬러 표시 -->
    <section class="color-display-section">
      <h2 class="color-title">COLOR</h2>
      <div class="color-list">
        ${colorList.map(color => `
          <span class="color-item ${color.isMain ? 'active' : ''}">
            <span class="color-dot ${color.isMain ? 'filled' : 'empty'}"></span>
            ${color.name}
          </span>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 6. 대표컬러 코디컷 + 문구 -->
    <section class="outfit-section">
      ${outfitImages
        .map(
          (img, idx) => `
        <div class="outfit-item">
          <img src="${img.processed || img.data}" alt="코디컷${idx + 1}">
          ${
            result.outfitCopies[idx]
              ? `
          <div class="outfit-text">
            <p class="outfit-caption">${result.outfitCopies[idx]}</p>
          </div>
          `
              : ''
          }
        </div>
      `
        )
        .join('')}
    </section>

    <!-- 7. 상품 정보 -->
    <section class="product-info-section">
      <h2 class="product-info-title">PRODUCT INFO</h2>
      <div class="product-info-grid">
        <div class="product-info-item">
          <p class="product-info-label">소재</p>
          <p class="product-info-value">${result.detail.material}</p>
        </div>
        <div class="product-info-item">
          <p class="product-info-label">핏</p>
          <p class="product-info-value">${result.detail.fit}</p>
        </div>
        <div class="product-info-item">
          <p class="product-info-label">디테일</p>
          <p class="product-info-value">${result.detail.detail}</p>
        </div>
        <div class="product-info-item">
          <p class="product-info-label">기타</p>
          <p class="product-info-value">${result.detail.etc}</p>
        </div>
      </div>
    </section>

    <!-- 푸터 -->
    <footer class="footer">
      <p>상품 관련 문의는 채팅 또는 고객센터를 이용해주세요</p>
    </footer>
  </div>
</body>
</html>
`.trim()

  return html
}

/**
 * HTML에서 이미지를 외부 URL로 대체 (실제 배포시 사용)
 */
export function replaceImagesWithUrls(html: string, imageUrls: string[]): string {
  let result = html
  imageUrls.forEach((url, idx) => {
    // base64 데이터 URL을 실제 URL로 교체
    result = result.replace(/data:image\/[^"]+/g, (match, offset) => {
      // 순차적으로 교체
      return imageUrls.shift() || match
    })
  })
  return result
}
