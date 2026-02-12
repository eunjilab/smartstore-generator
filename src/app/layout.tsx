import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스마트스토어 상세페이지 생성기',
  description: '상품 사진으로 상세페이지 문구 자동 생성',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Fonts - 한글 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;700&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&family=Nanum+Pen+Script&family=Nanum+Brush+Script&family=Black+Han+Sans&family=Gaegu:wght@400;700&family=Jua&family=Do+Hyeon&family=Gugi&family=Sunflower:wght@500;700&family=Gothic+A1:wght@400;700&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Dongle:wght@400;700&family=Cute+Font&family=Hi+Melody&family=IBM+Plex+Sans+KR:wght@400;500;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Spoqa Han Sans */}
        <link
          href="https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css"
          rel="stylesheet"
        />
        {/* Pretendard */}
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
