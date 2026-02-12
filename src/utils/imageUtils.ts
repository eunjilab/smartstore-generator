// 이미지 크롭 및 리사이즈 유틸리티

/**
 * 이미지를 압축하여 API 전송용으로 변환
 * Vercel 서버리스 함수 payload 제한(4.5MB) 대응
 */
export function compressImageForAPI(imageDataUrl: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 비율 유지하며 리사이즈
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = imageDataUrl
  })
}

/**
 * 이미지를 1:1 비율로 중앙 크롭 (대표이미지용)
 */
export function cropToSquare(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const size = Math.min(img.width, img.height)
      canvas.width = size
      canvas.height = size

      // 중앙 기준으로 크롭
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = reject
    img.src = imageDataUrl
  })
}

/**
 * 이미지를 3:4 비율로 크롭 (착장/디테일 이미지용)
 */
export function cropTo3x4(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const targetRatio = 3 / 4
      const currentRatio = img.width / img.height

      let cropWidth: number
      let cropHeight: number
      let offsetX = 0
      let offsetY = 0

      if (currentRatio > targetRatio) {
        // 이미지가 더 넓음 - 좌우를 자름
        cropHeight = img.height
        cropWidth = img.height * targetRatio
        offsetX = (img.width - cropWidth) / 2
      } else {
        // 이미지가 더 높음 - 상하를 자름
        cropWidth = img.width
        cropHeight = img.width / targetRatio
        offsetY = (img.height - cropHeight) / 2
      }

      canvas.width = cropWidth
      canvas.height = cropHeight

      ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = reject
    img.src = imageDataUrl
  })
}

/**
 * 모든 이미지를 처리 (대표: 1:1, 나머지: 3:4)
 */
export async function processImages(images: { type: string; data: string }[]): Promise<{ type: string; data: string; processed: string }[]> {
  const processed = await Promise.all(
    images.map(async (img, index) => {
      let processedData: string

      if (index === 0 || img.type === 'main') {
        // 대표이미지는 1:1
        processedData = await cropToSquare(img.data)
      } else {
        // 나머지는 3:4
        processedData = await cropTo3x4(img.data)
      }

      return {
        ...img,
        processed: processedData
      }
    })
  )

  return processed
}
