import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの初期化
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// CORSヘッダーの設定
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// エラーレスポンスの作成
export const errorResponse = (message, statusCode = 500) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ error: message })
  }
}

// 成功レスポンスの作成
export const successResponse = (data, statusCode = 200) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data)
  }
}