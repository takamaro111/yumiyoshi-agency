// API呼び出し用のヘルパー関数

class TopicsAPI {
  constructor() {
    this.baseURL = '/.netlify/functions'
  }

  // トピック一覧取得
  async getTopics() {
    try {
      const response = await fetch(`${this.baseURL}/topics`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching topics:', error)
      throw error
    }
  }

  // トピック作成
  async createTopic(topicData) {
    try {
      const response = await fetch(`${this.baseURL}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating topic:', error)
      throw error
    }
  }

  // トピック更新
  async updateTopic(topicData) {
    try {
      const response = await fetch(`${this.baseURL}/topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating topic:', error)
      throw error
    }
  }

  // トピック削除
  async deleteTopic(topicId, adminPassword) {
    try {
      const response = await fetch(`${this.baseURL}/topics`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: topicId, 
          admin_password: adminPassword 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error deleting topic:', error)
      throw error
    }
  }

  // 画像アップロード
  async uploadImage(imageData, filename, adminPassword) {
    try {
      const response = await fetch(`${this.baseURL}/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData,
          filename: filename,
          admin_password: adminPassword
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }
}

// APIインスタンスをエクスポート
window.topicsAPI = new TopicsAPI()