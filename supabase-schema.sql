-- トピックテーブルの作成
CREATE TABLE topics (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能なポリシー
CREATE POLICY "Anyone can view topics" ON topics
FOR SELECT USING (true);

-- 認証されたユーザーのみ挿入・更新・削除可能なポリシー
-- （実際の認証は Functions 側で行います）
CREATE POLICY "Authenticated users can insert topics" ON topics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update topics" ON topics
FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete topics" ON topics
FOR DELETE USING (true);

-- Storage バケットの作成（手動で作成する必要があります）
-- Supabase ダッシュボードで以下の設定を行ってください：
-- 1. Storage > Create Bucket
-- 2. Bucket name: "topic-images"
-- 3. Public bucket: true (画像を公開表示するため)

-- Storage のポリシー設定（手動で設定）
-- 1. 誰でも画像を表示可能
-- 2. 認証されたユーザーのみアップロード可能