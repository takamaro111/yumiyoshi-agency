import { supabase, corsHeaders, errorResponse, successResponse } from './utils/supabase.js'

export const handler = async (event, context) => {
  // CORS対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const { image_data, filename, admin_password } = JSON.parse(event.body)

    // 管理者パスワードチェック
    if (admin_password !== process.env.ADMIN_PASSWORD) {
      return errorResponse('Unauthorized', 401)
    }

    // Base64データをBufferに変換
    const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // ファイル名にタイムスタンプを追加
    const timestamp = Date.now()
    const extension = filename.split('.').pop()
    const uniqueFilename = `${timestamp}.${extension}`

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('topic-images')
      .upload(uniqueFilename, buffer, {
        contentType: `image/${extension}`,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return errorResponse(error.message)
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('topic-images')
      .getPublicUrl(uniqueFilename)

    return successResponse({ 
      message: 'Image uploaded successfully',
      url: publicUrl 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('Failed to upload image')
  }
}