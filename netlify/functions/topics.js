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

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getTopics()
      case 'POST':
        return await createTopic(event.body)
      case 'PUT':
        return await updateTopic(event.body)
      case 'DELETE':
        return await deleteTopic(event.body)
      default:
        return errorResponse('Method not allowed', 405)
    }
  } catch (error) {
    console.error('Error:', error)
    return errorResponse('Internal server error')
  }
}

// トピック一覧取得
async function getTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return errorResponse(error.message)
  }

  return successResponse(data)
}

// トピック作成
async function createTopic(body) {
  const { title, content, image_url, admin_password } = JSON.parse(body)

  // 管理者パスワードチェック
  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return errorResponse('Unauthorized', 401)
  }

  const { data, error } = await supabase
    .from('topics')
    .insert([
      {
        title,
        content,
        image_url,
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
      }
    ])
    .select()

  if (error) {
    return errorResponse(error.message)
  }

  return successResponse(data[0], 201)
}

// トピック更新
async function updateTopic(body) {
  const { id, title, content, image_url, admin_password } = JSON.parse(body)

  // 管理者パスワードチェック
  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return errorResponse('Unauthorized', 401)
  }

  const { data, error } = await supabase
    .from('topics')
    .update({ title, content, image_url })
    .eq('id', id)
    .select()

  if (error) {
    return errorResponse(error.message)
  }

  return successResponse(data[0])
}

// トピック削除
async function deleteTopic(body) {
  const { id, admin_password } = JSON.parse(body)

  // 管理者パスワードチェック
  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return errorResponse('Unauthorized', 401)
  }

  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id)

  if (error) {
    return errorResponse(error.message)
  }

  return successResponse({ message: 'Topic deleted successfully' })
}