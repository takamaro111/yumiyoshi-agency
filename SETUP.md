# 弓義エージェンシー - Netlify + Supabase セットアップ手順

## 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. 新しいプロジェクトを作成
4. データベースパスワードを設定

## 2. データベースの設定

1. Supabase ダッシュボードの「SQL Editor」を開く
2. `supabase-schema.sql` の内容をコピー＆ペースト
3. 「RUN」ボタンをクリックして実行

## 3. Storage の設定

1. Supabase ダッシュボードの「Storage」を開く
2. 「Create Bucket」をクリック
3. Bucket name: `topic-images`
4. Public bucket: `true` にチェック
5. 「Create bucket」をクリック

### Storage ポリシーの設定
1. 作成した `topic-images` バケットをクリック
2. 「Policies」タブを開く
3. 以下のポリシーを追加：

**読み取りポリシー（誰でも画像を表示可能）:**
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'topic-images');
```

**アップロードポリシー（認証されたユーザーのみ）:**
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'topic-images');
```

## 4. 環境変数の設定

1. Supabase ダッシュボードの「Settings」→「API」を開く
2. 以下の値をコピー：
   - Project URL
   - anon public key
   - service_role key

3. `.env.example` をコピーして `.env` ファイルを作成
4. 環境変数を設定：

```env
SUPABASE_URL=あなたのProjectURL
SUPABASE_ANON_KEY=あなたのanonkey
SUPABASE_SERVICE_ROLE_KEY=あなたのservice_rolekey
ADMIN_PASSWORD=2t8ysefg
```

## 5. Netlify への デプロイ

### 初回デプロイ
1. [Netlify](https://netlify.com) にサインアップ/ログイン
2. 「New site from Git」をクリック
3. GitHubリポジトリを連携
4. Build settings:
   - Build command: （空のまま）
   - Publish directory: `.`

### 環境変数の設定
1. Netlify サイトの「Site settings」→「Environment variables」
2. `.env` ファイルの内容を追加：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`

## 6. ローカル開発

```bash
# 依存関係をインストール
npm install

# ローカル開発サーバー起動
npm run dev
```

## 7. 機能確認

1. サイトにアクセス
2. 「管理者ログイン」をクリック
3. パスワード `2t8ysefg` でログイン
4. 「新しい実績を追加」で投稿テスト
5. 投稿、編集、削除が正常に動作することを確認

## トラブルシューティング

### Functions エラーが発生する場合
- Netlify の Functions ログを確認
- 環境変数が正しく設定されているか確認
- Supabase の RLS ポリシーを確認

### 画像アップロードが失敗する場合
- Storage バケットが作成されているか確認
- Storage ポリシーが正しく設定されているか確認
- 画像サイズが適切か確認（推奨: 2MB以下）

### データが表示されない場合
- Supabase ダッシュボードでテーブルにデータが存在するか確認
- ブラウザのネットワークタブでAPI呼び出しエラーを確認