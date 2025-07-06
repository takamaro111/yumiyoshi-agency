console.log('Script.js loaded');

// DOM要素の取得
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // ハンバーガーメニュー
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // モバイルメニューを閉じる
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // ヘッダーの背景変更
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // お問い合わせフォームの処理
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // バリデーション
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('必須項目を入力してください。');
                return;
            }

            // メール形式チェック
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(data.email)) {
                alert('正しいメールアドレスを入力してください。');
                return;
            }

            // 送信処理（実際の送信はサーバーサイドで実装）
            alert('お問い合わせありがとうございます。\n内容を確認の上、3営業日以内にご連絡いたします。');
            contactForm.reset();
        });
    }

    // ログイン状態管理
    let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    const adminPassword = '2t8ysefg';
    
    // トピック管理用変数
    let topics = [];
    let isLoading = false;
    
    // モーダル機能
    const loginModal = document.getElementById('login-modal');
    const topicModal = document.getElementById('topic-modal');
    const loginBtn = document.getElementById('login-btn');
    const addTopicBtn = document.getElementById('add-topic-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginCloseBtn = document.getElementById('login-close');
    const topicCloseBtn = document.getElementById('topic-close');
    const loginForm = document.getElementById('login-form');
    const topicForm = document.getElementById('topic-form');
    const topicModalTitle = document.getElementById('topic-modal-title');
    const topicSubmitBtn = document.getElementById('topic-submit-btn');
    
    // 編集状態管理
    let isEditMode = false;
    let editingTopicId = null;
    
    // 表示状態管理
    let showAllTopics = false;
    const maxVisibleTopics = 3;

    // デバッグ: 要素の存在確認
    console.log('Login button:', loginBtn);
    console.log('Login modal:', loginModal);
    console.log('All buttons loaded');
    
    // ログイン状態の初期設定
    function updateLoginState() {
        if (isLoggedIn) {
            loginBtn.style.display = 'none';
            addTopicBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            addTopicBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }

    // ログインボタン
    if (loginBtn) {
        console.log('Adding click event to login button');
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login button clicked!');
            if (loginModal) {
                loginModal.style.display = 'block';
                console.log('Modal display set to block');
            } else {
                console.error('Login modal not found!');
            }
        });
    } else {
        console.error('Login button not found!');
    }

    // ログアウトボタン
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            isLoggedIn = false;
            localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
            updateLoginState();
            // 削除ボタンを非表示にするため表示を更新
            displayTopics();
            alert('ログアウトしました。');
        });
    }

    // トピック追加ボタン
    if (addTopicBtn) {
        addTopicBtn.addEventListener('click', function() {
            if (isLoggedIn) {
                openTopicModal();
            }
        });
    }

    // モーダルを開く関数（新規追加用）
    function openTopicModal() {
        isEditMode = false;
        editingTopicId = null;
        topicModalTitle.textContent = '新しい実績を追加';
        topicSubmitBtn.textContent = '追加する';
        topicForm.reset();
        document.getElementById('topic-id').value = '';
        
        // 現在の画像プレビューをクリア
        const currentImagePreview = document.getElementById('current-image-preview');
        currentImagePreview.innerHTML = '';
        
        // プレビュー画像を削除
        const preview = document.querySelector('.topic-image-preview');
        if (preview) {
            preview.remove();
        }
        
        topicModal.style.display = 'block';
    }

    // モーダルを開く関数（編集用）
    function openEditModal(topicId) {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        isEditMode = true;
        editingTopicId = topicId;
        topicModalTitle.textContent = '実績を編集';
        topicSubmitBtn.textContent = '更新する';
        
        // フォームに既存データを設定
        document.getElementById('topic-id').value = topic.id;
        document.getElementById('topic-title').value = topic.title;
        document.getElementById('topic-content').value = topic.content;
        
        // 現在の画像を表示
        const currentImagePreview = document.getElementById('current-image-preview');
        if (topic.image_url) {
            currentImagePreview.innerHTML = `
                <div style="margin-top: 10px;">
                    <p style="font-size: 12px; color: #666; margin-bottom: 5px;">現在の画像:</p>
                    <img src="${topic.image_url}" alt="現在の画像" style="max-width: 200px; max-height: 150px; border-radius: 5px;">
                </div>
            `;
        } else {
            currentImagePreview.innerHTML = '';
        }
        
        // プレビュー画像を削除
        const preview = document.querySelector('.topic-image-preview');
        if (preview) {
            preview.remove();
        }
        
        topicModal.style.display = 'block';
    }

    // モーダルクローズボタン
    if (loginCloseBtn) {
        loginCloseBtn.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }

    if (topicCloseBtn) {
        topicCloseBtn.addEventListener('click', function() {
            topicModal.style.display = 'none';
        });
    }

    // モーダル外クリックでクローズ
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === topicModal) {
            topicModal.style.display = 'none';
        }
    });

    // ログインフォーム
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            
            if (password === adminPassword) {
                isLoggedIn = true;
                localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
                updateLoginState();
                // 削除ボタンを表示するため表示を更新
                displayTopics();
                loginModal.style.display = 'none';
                loginForm.reset();
                alert('ログインしました。');
            } else {
                alert('パスワードが間違っています。');
            }
        });
    }

    // 画像プレビュー機能
    const imageInput = document.getElementById('topic-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // 既存のプレビューを削除
                    const existingPreview = document.querySelector('.topic-image-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                    
                    // 新しいプレビューを作成
                    const preview = document.createElement('img');
                    preview.src = e.target.result;
                    preview.className = 'topic-image-preview';
                    imageInput.parentNode.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // トピック追加・編集フォーム
    if (topicForm) {
        topicForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!isLoggedIn) {
                alert('ログインが必要です。');
                return;
            }

            const formData = new FormData(topicForm);
            const imageFile = formData.get('image');
            const topicId = formData.get('id');
            
            const topicData = {
                title: formData.get('title'),
                content: formData.get('content'),
            };

            // バリデーション
            if (!topicData.title || !topicData.content) {
                alert('タイトルと内容を入力してください。');
                return;
            }

            // 画像がある場合の処理
            if (imageFile && imageFile.size > 0) {
                try {
                    // 画像をBase64に変換
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        try {
                            // 画像をアップロード
                            const uploadResult = await window.topicsAPI.uploadImage(
                                e.target.result,
                                imageFile.name,
                                adminPassword
                            );
                            
                            // アップロードした画像URLをtopicDataに追加
                            topicData.image_url = uploadResult.url;
                            
                            if (isEditMode && editingTopicId) {
                                topicData.id = editingTopicId;
                                await saveAndDisplayTopic(topicData, true);
                            } else {
                                await saveAndDisplayTopic(topicData, false);
                            }
                        } catch (error) {
                            console.error('Image upload error:', error);
                            alert('画像のアップロードに失敗しました: ' + error.message);
                        }
                    };
                    reader.readAsDataURL(imageFile);
                } catch (error) {
                    console.error('File read error:', error);
                    alert('ファイルの読み込みに失敗しました');
                }
            } else {
                // 画像がない場合
                if (isEditMode && editingTopicId) {
                    topicData.id = editingTopicId;
                    // 編集時に画像が選択されていない場合、既存の画像URLを保持
                    const existingTopic = topics.find(t => t.id === editingTopicId);
                    if (existingTopic) {
                        topicData.image_url = existingTopic.image_url;
                    }
                    await saveAndDisplayTopic(topicData, true);
                } else {
                    topicData.image_url = null;
                    await saveAndDisplayTopic(topicData, false);
                }
            }
        });
    }

    // トピック保存と表示の共通処理
    async function saveAndDisplayTopic(topicData, isEdit) {
        isLoading = true;
        
        try {
            if (isEdit) {
                // 編集の場合
                await window.topicsAPI.updateTopic({
                    ...topicData,
                    admin_password: adminPassword
                });
                alert('トピックが更新されました！');
            } else {
                // 新規追加の場合
                await window.topicsAPI.createTopic({
                    ...topicData,
                    admin_password: adminPassword
                });
                alert('新しいトピックが追加されました！');
            }

            // 表示を更新
            await displayTopics();

            // モーダルを閉じる
            topicModal.style.display = 'none';
            topicForm.reset();
            
            // プレビュー画像を削除
            const preview = document.querySelector('.topic-image-preview');
            if (preview) {
                preview.remove();
            }
            
            // 現在の画像プレビューをクリア
            const currentImagePreview = document.getElementById('current-image-preview');
            currentImagePreview.innerHTML = '';
            
            // 編集状態をリセット
            isEditMode = false;
            editingTopicId = null;

        } catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました: ' + error.message);
        } finally {
            isLoading = false;
        }
    }

    // トピックの表示
    async function displayTopics() {
        const topicsContent = document.querySelector('.topics-content');
        const addTopicBtnContainer = document.querySelector('.add-topic-btn');
        
        if (!topicsContent) return;

        // ローディング状態を表示
        if (isLoading) {
            showLoading(topicsContent);
            return;
        }

        try {
            // APIからトピックを取得
            topics = await window.topicsAPI.getTopics();
        } catch (error) {
            console.error('Failed to load topics:', error);
            showError(topicsContent, 'トピックの読み込みに失敗しました');
            return;
        }

        // 既存のトピックアイテムを削除（追加ボタンは保持）
        const existingTopics = topicsContent.querySelectorAll('.topic-item');
        existingTopics.forEach(topic => topic.remove());

        // トピックを表示
        topics.forEach((topic, index) => {
            const topicElement = document.createElement('div');
            topicElement.className = 'topic-item';
            topicElement.dataset.topicId = topic.id;
            
            // 3件を超える場合は非表示にする
            if (!showAllTopics && index >= maxVisibleTopics) {
                topicElement.classList.add('hidden');
            }
            
            let actionsHtml = '';
            if (isLoggedIn) {
                actionsHtml = `
                    <div class="topic-actions">
                        <button class="edit-btn" data-topic-id="${topic.id}" title="編集"></button>
                        <button class="delete-btn" data-topic-id="${topic.id}" title="削除"></button>
                    </div>
                `;
            }
            
            let imageHtml = '';
            let contentClass = 'topic-content';
            
            if (topic.image_url) {
                imageHtml = `<img src="${topic.image_url}" alt="${topic.title}" class="topic-image">`;
                topicElement.innerHTML = `
                    ${actionsHtml}
                    <div class="topic-date">${topic.date}</div>
                    <h3>${topic.title}</h3>
                    <div class="${contentClass}">
                        ${imageHtml}
                        <div class="topic-text">
                            <p>${topic.content}</p>
                        </div>
                    </div>
                `;
            } else {
                topicElement.innerHTML = `
                    ${actionsHtml}
                    <div class="topic-date">${topic.date}</div>
                    <h3>${topic.title}</h3>
                    <div class="topic-text">
                        <p>${topic.content}</p>
                    </div>
                `;
            }
            
            // 追加ボタンの前に挿入
            if (addTopicBtnContainer) {
                topicsContent.insertBefore(topicElement, addTopicBtnContainer);
            } else {
                topicsContent.appendChild(topicElement);
            }
        });
        
        // 「続きを見る」ボタンの表示制御
        showMoreButtonControl();
        
        // 編集・削除ボタンのイベントリスナーを追加
        if (isLoggedIn) {
            addActionEventListeners();
        }
    }

    // 「続きを見る」ボタンの制御
    function showMoreButtonControl() {
        const addTopicBtnContainer = document.querySelector('.add-topic-btn');
        const topicsContent = document.querySelector('.topics-content');
        
        // 既存の「続きを見る」ボタンを削除
        const existingShowMoreBtn = document.querySelector('.show-more-btn');
        if (existingShowMoreBtn) {
            existingShowMoreBtn.remove();
        }
        
        // 3件を超える場合のみ「続きを見る」ボタンを表示
        if (topics.length > maxVisibleTopics) {
            const showMoreBtn = document.createElement('div');
            showMoreBtn.className = 'show-more-btn';
            
            if (showAllTopics) {
                showMoreBtn.innerHTML = '<button id="show-less-btn">閉じる</button>';
            } else {
                showMoreBtn.innerHTML = '<button id="show-more-btn">続きを見る</button>';
            }
            
            // 追加ボタンの前に挿入
            if (addTopicBtnContainer) {
                topicsContent.insertBefore(showMoreBtn, addTopicBtnContainer);
            } else {
                topicsContent.appendChild(showMoreBtn);
            }
            
            // ボタンのイベントリスナーを追加
            addShowMoreEventListener();
        }
    }

    // 「続きを見る」ボタンのイベントリスナー
    function addShowMoreEventListener() {
        const showMoreBtn = document.getElementById('show-more-btn');
        const showLessBtn = document.getElementById('show-less-btn');
        
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', function() {
                showAllTopics = true;
                displayTopics();
            });
        }
        
        if (showLessBtn) {
            showLessBtn.addEventListener('click', function() {
                showAllTopics = false;
                displayTopics();
                
                // TOPICSセクションの先頭にスクロール
                const topicsSection = document.getElementById('topics');
                if (topicsSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = topicsSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // ローディング表示
    function showLoading(container) {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-message';
        loadingElement.innerHTML = '<p>読み込み中...</p>';
        container.appendChild(loadingElement);
    }

    // エラー表示
    function showError(container, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
        container.appendChild(errorElement);
    }

    // ページロード時にトピックを表示
    displayTopics();
    
    // ページロード時にログイン状態を設定
    updateLoginState();

    // スクロールインジケーターのクリックイベント
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // 編集・削除機能
    function addActionEventListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const topicId = parseInt(this.dataset.topicId);
                openEditModal(topicId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const topicId = parseInt(this.dataset.topicId);
                const topicElement = this.closest('.topic-item');
                const topicTitle = topicElement.querySelector('h3').textContent;
                
                if (confirm(`「${topicTitle}」を削除しますか？\nこの操作は取り消せません。`)) {
                    deleteTopic(topicId);
                }
            });
        });
    }

    async function deleteTopic(topicId) {
        isLoading = true;
        
        try {
            await window.topicsAPI.deleteTopic(topicId, adminPassword);
            alert('トピックが削除されました。');
            
            // 表示を更新
            await displayTopics();
        } catch (error) {
            console.error('Delete error:', error);
            alert('削除に失敗しました: ' + error.message);
        } finally {
            isLoading = false;
        }
    }

    // フェードインアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // 監視対象の要素を追加
    document.querySelectorAll('.work-item, .topic-item, .about-content, .philosophy-content, .recruit-content, .contact-content').forEach(el => {
        observer.observe(el);
    });

    // キーボードナビゲーション
    document.addEventListener('keydown', function(e) {
        // Escキーでモーダルを閉じる
        if (e.key === 'Escape') {
            if (loginModal && loginModal.style.display === 'block') {
                loginModal.style.display = 'none';
            }
            if (topicModal && topicModal.style.display === 'block') {
                topicModal.style.display = 'none';
            }
        }
    });

    // アクセシビリティ: フォーカス管理
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #333';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // パフォーマンス最適化: スクロールイベントのスロットリング
    let ticking = false;
    function updateOnScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });

    // 動的な年の設定
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-right p');
    if (footerYear) {
        footerYear.innerHTML = `&copy; ${currentYear} 株式会社 弓義エージェンシー. All rights reserved.`;
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    images.forEach(img => {
        if (img.dataset.src) {
            imageObserver.observe(img);
        }
    });

    // エラーハンドリング
    window.addEventListener('error', function(e) {
        console.error('JavaScriptエラーが発生しました:', e.error);
    });

    // デバッグ情報（開発時のみ）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('株式会社 弓義エージェンシー - ウェブサイトが正常に読み込まれました');
        console.log('保存されたトピック数:', topics.length);
    }
});